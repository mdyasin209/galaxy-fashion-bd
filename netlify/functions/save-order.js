/*const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TOKEN = process.env.AIRTABLE_TOKEN;
const ORDERS_TABLE = "Orders";

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "save-order function is working. Waiting for Netlify form POST."
      })
    };
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const data = payload.data || payload;

    const fields = {
      "Customer Name": data.customer_name || "",
      "Phone": data.phone || "",
      "Address": data.address || "",
      "Size": data.size || "",
      "Shipment": data.shipment || "",
      "Order Items": data.order_items || "",
      "Product Codes": data.product_codes || "",
      "Subtotal": Number(data.subtotal || 0),
      "Delivery Charge": Number(data.delivery_charge || 0),
      "Total Amount": Number(data.total_amount || 0),
      "Order Note": data.order_note || "",
      "Submitted At": new Date().toISOString()
    };

    const res = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(ORDERS_TABLE)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fields })
      }
    );

    const responseText = await res.text();

    if (!res.ok) {
      throw new Error(responseText);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, airtable: responseText })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};*/


const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TOKEN = process.env.AIRTABLE_TOKEN;
const ORDERS_TABLE = "Orders";

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "save-order function is working. Waiting for Netlify form POST."
      })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    console.log("NETLIFY WEBHOOK BODY:", JSON.stringify(body));

    const data =
      body?.payload?.data ||
      body?.data ||
      body?.submission?.data ||
      body?.submission ||
      body?.payload ||
      body;

    console.log("FINAL DATA:", JSON.stringify(data));

    const fields = {
      "Customer Name": data.customer_name || data["Customer Name"] || "",
      "Phone": data.phone || data.Phone || "",
      "Address": data.address || data.Address || "",
      "Size": data.size || data.Size || "",
      "Shipment": data.shipment || data.Shipment || "",
      "Order Items": data.order_items || data["Order Items"] || "",
      "Product Codes": data.product_codes || data["Product Codes"] || "",
      "Subtotal": Number(data.subtotal || data.Subtotal || 0),
      "Delivery Charge": Number(data.delivery_charge || data["Delivery Charge"] || 0),
      "Total Amount": Number(data.total_amount || data["Total Amount"] || 0),
      "Order Note": data.order_note || data["Order Note"] || "",
      "Submitted At": new Date().toISOString()
    };

    console.log("AIRTABLE FIELDS:", JSON.stringify(fields));

    const res = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(ORDERS_TABLE)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fields })
      }
    );

    const responseText = await res.text();

    console.log("AIRTABLE RESPONSE:", responseText);

    if (!res.ok) {
      throw new Error(responseText);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error("SAVE ORDER ERROR:", error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};