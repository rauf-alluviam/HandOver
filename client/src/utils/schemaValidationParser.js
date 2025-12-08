// src/utils/schemaValidationParser.js
export const parseSchemaValidationErrors = (validationErrors) => {
  const fieldErrors = {};

  if (!validationErrors || !Array.isArray(validationErrors)) {
    return fieldErrors;
  }

  validationErrors.forEach((error) => {
    if (typeof error === "string" && error.includes("schema violations")) {
      // Skip header lines
      return;
    }

    // Parse JSON path to field name
    const pathMatch = error.match(/#(\/.+?):/);
    if (!pathMatch) return;

    const jsonPath = pathMatch[1];
    const errorMessage = error.split(":").slice(1).join(":").trim();

    // Convert JSON path to field name
    const fieldName = convertJsonPathToFieldName(jsonPath);
    if (fieldName) {
      fieldErrors[fieldName] = errorMessage;
    }
  });

  return fieldErrors;
};

const convertJsonPathToFieldName = (jsonPath) => {
  // Remove leading slash
  let path = jsonPath.substring(1);

  // Handle cntrList paths (container fields)
  if (path.startsWith("cntrList/")) {
    // Example: /cntrList/0/doNo -> container_0_doNo
    path = path.replace("cntrList/", "container_").replace("/", "_");
  }

  // Handle sbDtlsVo paths
  if (path.includes("sbDtlsVo/")) {
    // Example: /cntrList/0/sbDtlsVo/0/noOfPkg -> container_0_noOfPkg
    path = path.replace(/sbDtlsVo\/\d+\//, "");
  }

  return path;
};

// Alternative: More robust parser
export const parseSchemaErrors = (schemaValidations) => {
  const errors = {};

  schemaValidations?.forEach((validation) => {
    if (typeof validation === "string" && validation.startsWith("#/")) {
      const [pathPart, ...messageParts] = validation.split(": ");
      const errorMessage = messageParts.join(": ");

      if (pathPart) {
        const fieldPath = pathPart.substring(2); // Remove "#/"
        const fieldKey = mapApiPathToFieldKey(fieldPath);

        if (fieldKey) {
          errors[fieldKey] = errorMessage;
        }
      }
    }
  });

  return errors;
};

const mapApiPathToFieldKey = (apiPath) => {
  // Map API JSON paths to form field names
  const pathMappings = {
    // Header fields
    bookNo: "bookNo",
    issueTo: "issueTo",
    consigneeNm: "consigneeNm",

    // Container fields (dynamic)
    "cntrList/[index]/doNo": (index) => `container_${index}_doNo`,
    "cntrList/[index]/iso": (index) => `container_${index}_iso`,
    "cntrList/[index]/agentSealNo": (index) => `container_${index}_agentSealNo`,
    "cntrList/[index]/customSealNo": (index) =>
      `container_${index}_customSealNo`,
    "cntrList/[index]/volt": (index) => `container_${index}_volt`,

    // Dimension fields
    "cntrList/[index]/backDimensions": (index) =>
      `container_${index}_backDimensions`,
    "cntrList/[index]/leftDimensions": (index) =>
      `container_${index}_leftDimensions`,
    "cntrList/[index]/frontDimensions": (index) =>
      `container_${index}_frontDimensions`,
    "cntrList/[index]/topDimensions": (index) =>
      `container_${index}_topDimensions`,
    "cntrList/[index]/rightDimensions": (index) =>
      `container_${index}_rightDimensions`,

    // Shipping bill fields
    "cntrList/[index]/sbDtlsVo/[sbIndex]/noOfPkg": (index, sbIndex) =>
      `container_${index}_sbDtlsVo_${sbIndex}_noOfPkg`,
    "cntrList/[index]/sbDtlsVo/[sbIndex]/leoDt": (index, sbIndex) =>
      `container_${index}_sbDtlsVo_${sbIndex}_leoDt`,
    "cntrList/[index]/sbDtlsVo/[sbIndex]/shipBillDt": (index, sbIndex) =>
      `container_${index}_sbDtlsVo_${sbIndex}_shipBillDt`,
  };

  // Parse the path
  const parts = apiPath.split("/");

  // Check for exact matches first
  if (pathMappings[apiPath]) {
    return apiPath;
  }

  // Check for dynamic paths
  for (const [pattern, mapper] of Object.entries(pathMappings)) {
    if (pattern.includes("[index]")) {
      const patternRegex = pattern
        .replace("[index]", "(\\d+)")
        .replace("[sbIndex]", "(\\d+)");
      const match = apiPath.match(new RegExp(patternRegex));

      if (match) {
        if (typeof mapper === "function") {
          return mapper(...match.slice(1).map(Number));
        }
      }
    }
  }

  return null;
};
