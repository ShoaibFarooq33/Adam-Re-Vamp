// deploy.js
const axios = require("axios");

const deployVercel = async () => {
  try {
    const response = await axios.post(
      "https://api.vercel.com/v1/integrations/deploy/prj_kulzwlD9mLHQOqANVjenfA2Dpjmx/hJNThwcfBM"
    );
    console.log("Deploy successful:", response.data);
  } catch (error) {
    console.error("Deploy failed:", error);
  }
};

deployVercel();
