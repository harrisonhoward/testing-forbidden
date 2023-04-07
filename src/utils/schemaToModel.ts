import { Schema, Model, model, InferSchemaType } from "mongoose";

export type SchemaType = Record<string, Schema>;

export type ModelType<T extends SchemaType> = Record<
    keyof T,
    Model<InferSchemaType<T[keyof T]>>
>;

const schemaToModel = <T extends SchemaType>(obj: T): ModelType<T> => {
    const result: Partial<Record<string, unknown>> = {};
    Object.entries(obj).forEach(([collectionName, schema]) => {
        result[collectionName] = model(collectionName, schema);
    });
    return result as ModelType<T>;
};

export default schemaToModel;
