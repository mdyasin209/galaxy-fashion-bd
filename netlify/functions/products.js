const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TOKEN = process.env.AIRTABLE_TOKEN;

const TABLES = {
  main: "Main Product",
  related: "Related Products",
  hero: "Hero Slider",
};

function getAttachmentUrl(field) {
  if (!field || !Array.isArray(field) || !field[0]) return "";
  return field[0].url || "";
}

function getGalleryUrls(field) {
  if (!field || !Array.isArray(field)) return [];
  return field.map(item => item.url).filter(Boolean);
}

async function fetchTable(tableName) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableName)}?filterByFormula={Active}=1`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`${tableName} fetch failed: ${error}`);
  }

  const data = await res.json();
  return data.records || [];
}

exports.handler = async function () {
  try {
    const [mainRecords, relatedRecords, heroRecords] = await Promise.all([
      fetchTable(TABLES.main),
      fetchTable(TABLES.related),
      fetchTable(TABLES.hero),
    ]);

    const main = mainRecords[0]?.fields || {};

    const products = [
      {
        id: "combo",
        code: main["Product Code"] || "",
        name: main["Product Name"] || "",
        desc: "2 Premium Shirts",
        price: Number(main["Price"] || 0),
        img: getAttachmentUrl(main["Product Image"]),
        gallery: [
          getAttachmentUrl(main["Product Image"]),
          getAttachmentUrl(main["Showcase 1 Image"]),
          getAttachmentUrl(main["Showcase 2 Image"]),
        ].filter(Boolean),
      },
      ...relatedRecords
        .map(record => {
          const f = record.fields;
          return {
            id: record.id,
            code: f["Product Code"] || "",
            name: f["Product Name"] || "",
            desc: f["Short Description"] || "",
            price: Number(f["Price"] || 0),
            img: getAttachmentUrl(f["Thumbnail Image"]),
            gallery: getGalleryUrls(f["Gallery Images"]),
          };
        })
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
    ];

    const heroSlides = heroRecords
      .map(record => {
        const f = record.fields;
        return {
          name: f["Slide Name"] || "",
          desktopImage: getAttachmentUrl(f["Desktop Image"]),
          mobileImage: getAttachmentUrl(f["Mobile Image"]),
          sortOrder: Number(f["Sort Order"] || 0),
        };
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const showcase = {
      one: {
        image: getAttachmentUrl(main["Showcase 1 Image"]),
        tag: main["Showcase 1 Tag"] || "",
        title: main["Showcase 1 Title"] || "",
        desc: main["Showcase 1 Description"] || "",
      },
      two: {
        image: getAttachmentUrl(main["Showcase 2 Image"]),
        tag: main["Showcase 2 Tag"] || "",
        title: main["Showcase 2 Title"] || "",
        desc: main["Showcase 2 Description"] || "",
      },
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({ products, heroSlides, showcase }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};