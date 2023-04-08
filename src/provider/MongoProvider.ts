import mongoose, {
    InferSchemaType,
    Require_id,
    FilterQuery,
    UpdateQuery,
} from "mongoose";
import { container } from "@sapphire/framework";
import { EventEmitter } from "events";

// Utils
import { schemaToModel } from "../utils";

export interface MongoProviderOptions {
    /**
     * @default localhost
     */
    hostname?: string;
    /**
     * @default 27017
     */
    port?: number | string;
    database?: string;
    auth?: {
        username: string;
        password: string;
    };
}

export interface MongoConnection {
    hostname: string;
    port: number;
    database?: string;
    auth?: {
        username: string;
        password: string;
    };
}

export interface CollectionOptions {
    createCollectionIfNotExists?: boolean;
}

export interface InsertDocumentOptions extends CollectionOptions {}

export interface FindDocumentsOptions extends CollectionOptions {
    limit?: number;
    skip?: number;
}

export interface GetDocumentOptions extends CollectionOptions {}

export interface UpdateDocumentOptions extends CollectionOptions {
    createDocumentIfNotExists?: boolean;
}

export interface DeleteDocumentOptions extends CollectionOptions {}

export class MongoProvider<
    S extends Record<string, mongoose.Schema>
> extends EventEmitter {
    public options: MongoConnection;
    public db: typeof mongoose | undefined;

    private connectionAttempts: number;
    private models: Record<
        keyof S,
        mongoose.Model<InferSchemaType<S[keyof S]>>
    >;

    constructor(options: MongoProviderOptions, schemas: S) {
        super();
        this.options = MongoProvider.validationOptions(options);
        this.connectionAttempts = 0;

        // Create a model for each schema
        this.models = schemaToModel(schemas);

        this.connect();

        this.initialise = this.initialise.bind(this);
        this.connect = this.connect.bind(this);
        this.reconnect = this.reconnect.bind(this);
    }

    private async initialise(db: Promise<typeof mongoose>): Promise<void> {
        // Can not initalise provider if the connection is already present
        if (this.db) {
            throw new Error(
                "MongoProvider: Cannot initialise provider if a connection already exists."
            );
        }
        // Ensure the db is available
        if (!db) {
            throw new Error(
                "MongoProvider: Can not initialise provider without a db."
            );
        }
        // Wait for the connection to be established
        try {
            this.db = await db;
        } catch (error) {
            throw new Error(
                `MongoProvider: Failure to connect to database, provider failed to initialise. Please check your connection details and try again.\nError: ${error}`
            );
        }
        // Determine the connection was successful
        if (
            this.db.connection.readyState ===
            mongoose.ConnectionStates.connected
        ) {
            container.logger.info(
                "MongoProvider: Connected to database. Initialising provider..."
            );
            this.connectionAttempts = 0;
            // Listen to the connection and attempt to reconnect on loss of connection
            this.db.connection.addListener("disconnected", this._reconnect);
            this.emit("connected");
            container.logger.info("MongoProvider: Provider initialised.");
        } else {
            throw new Error(
                "MongoProvider: Failure to connect to database, provider failed to initialise. Please check your connection details and try again. No error logged."
            );
        }
    }

    private _reconnect(): void {
        container.logger.warn(
            "MongoProvider: Disconnected from database, attempting to reconnect..."
        );
        this.reconnect();
    }

    /**
     * Attempts to establish a connection to the database if a connection is not already defined
     */
    public async connect(): Promise<void> {
        if (this.db) {
            container.logger.warn(
                "MongoProvider: Cannot establish a new database connection if one already exists."
            );
            return;
        }
        const HOST = `${this.options.hostname}:${this.options.port}`;
        const AUTH = `${this.options.auth?.username}:${encodeURIComponent(
            this.options.auth?.password || ""
        )}`;
        // Create a connection using the URI parameters AUTH@HOSTNAME:PORT/DATABASE (Only using what's available)
        const URI = `mongodb://${this.options.auth ? `${AUTH}@` : ""}${HOST}/${
            this.options.database || ""
        }`;
        container.logger.info(
            "MongoProvider: Attempting to connect to the database..."
        );
        this.initialise(mongoose.connect(URI));
    }

    /**
     * Attempts to reconnect to the database in the event of a failure
     */
    public async reconnect(): Promise<void> {
        // If the database doesn't exist then there is nothing to reconnect to
        if (!this.db) {
            container.logger.warn(
                "MongoProvider: Cannot reconnect to the database if the connection doesn't exist."
            );
            return;
        }
        if (this.connectionAttempts >= 5) {
            throw new Error(
                "MongoProvider: Failed to reconnect to the database."
            );
        }
        // To reconnect we need to fully close the connection and then estable a new connection
        // To ratelimit this process will attempt a reconnection after 10 seconds
        await this.disconnect();
        setTimeout(() => {
            this.connectionAttempts++;
            this.connect();
        }, 10000);
    }

    /**
     * Will attempt to close the connection to the database if one exists
     */
    public async disconnect(): Promise<void> {
        if (!this.db) {
            container.logger.warn(
                "MongoProvider: Cannot disconnect from the database if the connection doesn't exist."
            );
            return;
        }
        // In the event of a disconnect we need to remove the listener that attempts reconnections
        this.db.connection.removeListener("disconnected", this._reconnect);
        await this.db.connection.close();
        this.db = undefined;
        this.connectionAttempts = 0;
    }

    public async waitForConnection(callback?: Function): Promise<void> {
        return new Promise((resolve) => {
            this.once("connected", () => {
                if (callback) {
                    callback();
                }
                resolve();
            });
        });
    }

    private getModel<K extends keyof typeof this.models>(
        modelName: K
    ): typeof this.models[K] | void {
        // Ensure that model exists
        if (!this.models[modelName]) {
            container.logger.warn(
                `MongoProvider: The collection name "${String(
                    modelName
                )}" has no specified schema.`
            );
            return;
        }
        return this.models[modelName];
    }

    /**
     * Return a boolean that represents if the ready state of the database is connected
     */
    public isConnected(): boolean {
        return (
            this.db?.connection.readyState ===
            mongoose.ConnectionStates.connected
        );
    }

    /**
     * Returns a mongoose Collection representative of the schema provided
     * @param collectionName This refers to the name of the schema provided in the constructor
     */
    public async getCollection(
        collectionName: keyof S,
        options: CollectionOptions = {}
    ): Promise<mongoose.Collection<mongoose.mongo.BSON.Document> | void> {
        // Ensure a connection has been established
        if (!this.isConnected()) {
            container.logger.warn(
                "MongoProvider: Cannot get collection if no database connection exists."
            );
            return;
        }
        const model = this.getModel(collectionName);
        if (model && options.createCollectionIfNotExists) {
            // Determine if the collection exists
            const collectionNames = (
                await this.db?.connection.db.listCollections().toArray()
            )?.map((collection) => collection.name);
            if (collectionNames && !collectionNames.includes(model.modelName)) {
                // Create the collection if it doesn't exist
                await this.db!.connection.createCollection(model.modelName);
            }
        }
        return model?.collection;
    }

    public async insertDocument<K extends keyof S>(
        collectionName: K,
        document: Omit<InferSchemaType<S[K]>, "createdAt" | "updatedAt">,
        options?: InsertDocumentOptions
    ): Promise<Require_id<InferSchemaType<S[K]>> | void> {
        // Ensure a connection has been established
        if (!this.isConnected()) {
            container.logger.warn(
                "MongoProvider: Cannot insert document if no database connection exists."
            );
            return;
        }
        // Ensure the collection exists and pass the insert options
        if (await this.getCollection(collectionName, options)) {
            const model = this.getModel(collectionName)!;
            const result = await model.create(document).catch((error) => {
                container.logger.error(error);
            });
            if (result) {
                return result.toObject();
            }
        }
    }

    public async findDocuments<K extends keyof S>(
        collectionName: K,
        filter: FilterQuery<InferSchemaType<S[K]>>,
        options?: FindDocumentsOptions
    ): Promise<Require_id<InferSchemaType<S[K]>>[] | void> {
        // Ensure a connection has been established
        if (!this.isConnected()) {
            container.logger.warn(
                "MongoProvider: Cannot find documents if no database connection exists."
            );
            return;
        }
        // Ensure the collection exists and pass the find options
        if (await this.getCollection(collectionName, options)) {
            const model = this.getModel(collectionName)!;
            const result = await model
                .find(
                    filter,
                    {},
                    { limit: options?.limit, skip: options?.skip }
                )
                .catch((error) => {
                    container.logger.error(error);
                });
            if (result) {
                return result.map((document) => document.toObject());
            }
        }
    }

    public async getDocument<K extends keyof S>(
        collectionName: K,
        filter: FilterQuery<InferSchemaType<S[K]>>,
        options?: GetDocumentOptions
    ): Promise<Require_id<InferSchemaType<S[K]>> | void> {
        // Ensure a connection has been established
        if (!this.isConnected()) {
            container.logger.warn(
                "MongoProvider: Cannot get document if no database connection exists."
            );
            return;
        }
        // Ensure the collection exists and pass the get options
        if (await this.getCollection(collectionName, options)) {
            const model = this.getModel(collectionName)!;
            const result = await model.findOne(filter).catch((error) => {
                container.logger.error(error);
            });
            if (result) {
                return result.toObject();
            }
        }
    }

    public async updateDocument<K extends keyof S>(
        collectionName: K,
        filter: FilterQuery<InferSchemaType<S[K]>>,
        update: UpdateQuery<
            Omit<InferSchemaType<S[K]>, "createdAt" | "updatedAt">
        >,
        options?: UpdateDocumentOptions
    ): Promise<Require_id<InferSchemaType<S[K]>> | void> {
        // Ensure a connection has been established
        if (!this.isConnected()) {
            container.logger.warn(
                "MongoProvider: Cannot update document if no database connection exists."
            );
            return;
        }
        // Ensure the collection exists and pass the update options
        if (await this.getCollection(collectionName, options)) {
            const model = this.getModel(collectionName)!;
            const result = await model
                .findOneAndUpdate(
                    filter,
                    // Removing createdAt and updatedAt will upset the model types because it expects those
                    // We are removing them because you can't update them (Unfortunately no way of detecting unique schema properties for now)
                    update as UpdateQuery<InferSchemaType<S[K]>>,
                    {
                        upsert: options?.createDocumentIfNotExists,
                        new: true,
                    }
                )
                .catch((error) => {
                    container.logger.error(error);
                });
            if (result) {
                return result.toObject();
            }
        }
    }

    public async deleteDocument<K extends keyof S>(
        collectionName: K,
        filter: FilterQuery<InferSchemaType<S[K]>>,
        options?: DeleteDocumentOptions
    ): Promise<boolean> {
        // Ensure a connection has been established
        if (!this.isConnected()) {
            container.logger.warn(
                "MongoProvider: Cannot delete document if no database connection exists."
            );
            return false;
        }
        // Ensure the collection exists and pass the delete options
        if (await this.getCollection(collectionName, options)) {
            const model = this.getModel(collectionName)!;
            const result = await model.deleteOne(filter);
            if (result) {
                return result.deletedCount === 1;
            }
        }
        return false;
    }

    static validationOptions(options: MongoProviderOptions): MongoConnection {
        // Validate hostname is a string
        let hostname = "localhost";
        if (typeof options.hostname === "string") {
            hostname = options.hostname;
        }
        // Validate port is a number (attempt conversion if not)
        let port = 27017;
        if (["number", "string"].includes(typeof options.port)) {
            if (isNaN(options.port)) {
                container.logger.warn(
                    "MongoProvider: Port is not a number, using default port (27017)"
                );
            } else {
                port = parseInt(options.port);
            }
        }
        // Validate database is a string
        let database: string | undefined;
        if (typeof options.database === "string") {
            database = options.database;
        }
        // Validate auth is an object with username and password
        let auth: MongoProviderOptions["auth"] | undefined;
        if (typeof options.auth === "object") {
            if (
                typeof options.auth.username !== "string" ||
                typeof options.auth.password !== "string"
            ) {
                throw new TypeError(
                    "MongoProvider: Auth object is missing username and/or password"
                );
            }
            auth = {
                username: options.auth.username,
                password: options.auth.password,
            };
        }
        return {
            hostname,
            port,
            database,
            auth,
        };
    }
}
