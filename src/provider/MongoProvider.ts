import mongoose from "mongoose";
import { container } from "@sapphire/framework";

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

export class MongoProvider {
    options: MongoConnection;
    db: typeof mongoose | undefined;
    private connectionAttempts: number;

    constructor(options: MongoProviderOptions) {
        this.options = MongoProvider.validationOptions(options);
        this.connectionAttempts = 0;
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
            this.db.connection.on("disconnected", () => {
                container.logger.warn(
                    "MongoProvider: Disconnected from database, attempting to reconnect..."
                );
                this.reconnect();
            });
        } else {
            throw new Error(
                "MongoProvider: Failure to connect to database, provider failed to initialise. Please check your connection details and try again. No error logged."
            );
        }
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
        const AUTH = `${this.options.auth?.username}:${this.options.auth?.password}`;
        // Create a connection using the URI parameters AUTH@HOSTNAME:PORT/DATABASE (Only using what's available)
        const URI = `mongodb://${this.options.auth ? `${AUTH}@` : ""}${HOST}/${
            this.options.database || ""
        }`;
        container.logger.info(
            `MongoProvider: Attempting to connect to "${URI}"...`
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
            throw new Error("MongoProvider: Failed to reconnect to database.");
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
        await this.db.connection.close();
        this.db = undefined;
        this.connectionAttempts = 0;
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
