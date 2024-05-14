import Airtable, { FieldSet, Records, SelectOptions } from "airtable";

// Check if REACT_APP_AIRTABLE_BASE is unset and throw an error if it is
const airtableBase = process.env.REACT_APP_AIRTABLE_BASE;
if (!airtableBase) {
  throw new Error(
    "REACT_APP_AIRTABLE_BASE is not set. Please set it in your environment variables."
  );
}

// Airtable configuration with TypeScript typing for the environment variables

export const airtable = new Airtable({
  apiKey: process.env.REACT_APP_AIRTABLE_API_KEY as string,
}).base(process.env.REACT_APP_AIRTABLE_BASE as string);

export { Airtable };

interface Select {
  maxRecords?: number;
  fields?: string[];
}

export type { Select, FieldSet, Records, SelectOptions };
