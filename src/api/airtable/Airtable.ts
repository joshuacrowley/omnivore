import Airtable, { FieldSet, Records, SelectOptions } from "airtable";
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
