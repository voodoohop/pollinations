import React, { useEffect, useState } from "react";

const CompaniesSection = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    console.log("isMobile status:", isMobile, "Screen width:", screenWidth);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile, screenWidth]);

  const logoPrefix = "minimalist logo";
  const imageDimension = 96;
  const seedValue = 41 + Math.floor(Math.random() * 3);

  const companies = [
    {
      name: "AWS Activate",
      url: "https://aws.amazon.com/",
      description: "GPU Cloud Credits",
    },
    {
      name: "Google Cloud for Startups",
      url: "https://cloud.google.com/",
      description: "GPU Cloud Credits",
    },
    {
      name: "OVH Cloud",
      url: "https://www.ovhcloud.com/",
      description: "GPU Cloud credits",
    },
    {
      name: "NVIDIA Inception",
      url: "https://www.nvidia.com/en-us/deep-learning-ai/startups/",
      description: "AI startup support",
    },
    {
      name: "Azure (MS for Startups)",
      url: "https://azure.microsoft.com/",
      description: "OpenAI credits",
    },
    {
      name: "Outlier Ventures",
      url: "https://outlierventures.io/",
      description: "Accelerator",
    },
  ];

  const generateImageUrl = (name, description) =>
    `https://pollinations.ai/p/${encodeURIComponent(
      `${logoPrefix} ${name} ${description}`
    )}?width=${imageDimension}&height=${imageDimension}&nologo=true&seed=${seedValue}`;

  const tableRows = [];
  for (let i = 0; i < companies.length; i += isMobile ? 1 : 2) {
    tableRows.push(
      <tr key={i}>
        <td className="p-2">
          <img src={generateImageUrl(companies[i].name, companies[i].description)} alt={companies[i].name} />
        </td>
        <td className="p-2">
          <a href={companies[i].url} className="underline text-white">
            {companies[i].name}
          </a>
          <br />
          {companies[i].description}
        </td>
        {!isMobile && companies[i + 1] && (
          <>
            <td className="p-2">
              <img src={generateImageUrl(companies[i + 1].name, companies[i + 1].description)} alt={companies[i + 1].name} />
            </td>
            <td className="p-2">
              <a href={companies[i + 1].url} className="underline text-white">
                {companies[i + 1].name}
              </a>
              <br />
              {companies[i + 1].description}
            </td>
          </>
        )}
      </tr>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold text-lime mt-4 mb-2 text-center">Supported By</h2>
      <table className="min-w-full bg-white">
        <tbody>{tableRows}</tbody>
      </table>
    </div>
  );
};

export default CompaniesSection;
