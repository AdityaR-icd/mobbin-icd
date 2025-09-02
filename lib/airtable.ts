export async function getAirtableRecords() {
  const res = await fetch(process.env.AIRTABLE_URL!, {
    method: "GET",
    headers: {
      Authorization: process.env.AIRTABLE_TOKEN!,
    },
    cache: "no-store", // optional, so data is always fresh
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Airtable records");
  }

  const data = await res.json();

  // console.log(data.records);
  return data.records;
}