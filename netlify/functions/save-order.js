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
};