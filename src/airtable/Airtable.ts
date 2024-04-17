import Airtable from "airtable";
// Airtable configuration with TypeScript typing for the environment variables
export const airtable = new Airtable({
  apiKey: process.env.REACT_APP_AIRTABLE_API_KEY as string,
}).base(process.env.REACT_APP_AIRTABLE_BASE as string);

export { Airtable };

interface Select {
  maxRecords?: number;
}

export type { Select };
