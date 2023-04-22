import { Schema, Model, model, InferSchemaType } from "mongoose";

/**
 * Key value pair of schemas
 */
export type SchemaType = Record<string, Schema>;

/**
 * Using the generic SchemaType we can use TypeScript to convert it to a key value pair of models
 */
export type ModelType<T extends SchemaType> = Record<
    keyof T,
    Model<InferSchemaType<T[keyof T]>>
>;

/**
 * Converts a key value mapping of schemas and converts it to a key value mapping of models
 */
export const schemaToModel = <T extends SchemaType>(obj: T): ModelType<T> => {
    const result: Partial<Record<string, unknown>> = {};
    Object.entries(obj).forEach(([collectionName, schema]) => {
        result[collectionName] = model(collectionName, schema);
    });
    return result as ModelType<T>;
};
