import { MongoError } from "mongodb";

export function catchErrors(callback) {
  return async function (...args) {
    try {
      return await callback(...args);
    } catch (e) {
      if (e instanceof HttpError) {
        return e.json();
      }
      const instance = typeof e;
      if (
        e instanceof MongoError ||
        e?.constructor?.name?.startsWith("Mongo") ||
        e?.constructor?.name?.startsWith("BSON")
      ) {
        return HttpError.mongo(e).json();
      }
      return HttpError.internal(e).json();
    }
  };
}
