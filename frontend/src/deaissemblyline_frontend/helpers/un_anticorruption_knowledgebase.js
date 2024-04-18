export const getResourceAsArray = (resourceId) => {
  switch(resourceId) {
    case 1:
      return getUnConventionAgainstCorruption();
      break;
    case 2:
      return getPolicyGuideForNationalAntiCorruptionAuthorities();
      break;
    case 3:
      return getYouthLedTalks();
      break;
    case 4:
      return getTeachersGuideToUsingForumTheatre();
      break;
    case 5:
      return getUniversityModuleSeriesOnAntiCorruption();
      break;
    default:
      return [];
  };
};

export const getUnConventionAgainstCorruption = async () => {
  // UNITED NATIONS CONVENTION AGAINST CORRUPTION: https://unodc.org/documents/treaties/UNCAC/Publications/Convention/08-50026_E.pdf
  let url = './UN_AntiCorruption_Materials/unconventionsagainstcorruptionpdf.pdf';
  // Loaded via <script> tag, create shortcut to access PDF.js exports.
  let { pdfjsLib } = globalThis;
  // The workerSrc property shall be specified.
  pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.mjs';

  let documentContent = [];
  try {
      const pdf = await pdfjsLib.getDocument(url).promise;
      console.log('PDF loaded');
      const numPages = pdf.numPages;
      const pageTextPromises = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const pagePromise = pdf.getPage(pageNum).then(page => {
          return page.getTextContent().then(textContent => {
            // Filter text items to remove those that contain only spaces or punctuation
            const filteredTextItems = textContent.items
                .map(item => item.str)
                .filter(str => str.trim().length > 0 && !/^\p{P}+$/u.test(str));

            // Concatenate and split text to ensure each entry is under 500 characters (the LLM's context window size might otherwise not be able to handle it)
            let combinedText = '';
            const pageTexts = [];

            for (const text of filteredTextItems) {
              if (combinedText.length + text.length > 1300) {
                pageTexts.push(combinedText);
                combinedText = text;
              } else {
                combinedText += (combinedText.length > 0 ? ' ' : '') + text;
              };
            };
            if (combinedText.length > 0) {
              pageTexts.push(combinedText);
            };
            console.log('pageTexts: ', pageTexts);
            return pageTexts.flat();
          });
        });
        pageTextPromises.push(pagePromise);
      };

      const pagesTextArrays = await Promise.all(pageTextPromises);
      // Flatten the array of arrays into a single array of strings
      documentContent = pagesTextArrays.flat();
      console.log('unConventionAgainstCorruptionContent: ', documentContent);
      return documentContent;
  } catch (reason) {
      // PDF loading error
      console.error('Error loading PDF: ', reason);
      return documentContent;  // Return an empty array in case of an error
  }
};

export const getPolicyGuideForNationalAntiCorruptionAuthorities = async () => {
  // POLICY GUIDE FOR NATIONAL ANTI-CORRUPTION AUTHORITIES ON MEANINGFUL YOUTH ENGAGEMENT IN ANTI-CORRUPTION WORK: https://grace.unodc.org/grace/en/youth-empowerment/policy-guide-for-national-anti-corruptionauthorities-on-meaningful-youth-engagement-in-anti-corruption-work.html
  let url = './UN_AntiCorruption_Materials/unpolicy_guide_full.pdf';
  // Loaded via <script> tag, create shortcut to access PDF.js exports.
  let { pdfjsLib } = globalThis;
  // The workerSrc property shall be specified.
  pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.mjs';

  let documentContent = [];
  try {
      const pdf = await pdfjsLib.getDocument(url).promise;
      console.log('PDF loaded');
      const numPages = pdf.numPages;
      const pageTextPromises = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const pagePromise = pdf.getPage(pageNum).then(page => {
          return page.getTextContent().then(textContent => {
            // Filter text items to remove those that contain only spaces or punctuation
            return textContent.items
              .map(item => item.str)
              .filter(str => str.trim().length > 0 && !/^\p{P}+$/u.test(str));
          });
        });
        pageTextPromises.push(pagePromise);
      };

      const pagesTextArrays = await Promise.all(pageTextPromises);
      // Flatten the array of arrays into a single array of strings
      documentContent = pagesTextArrays.flat();
      console.log('getPolicyGuideForNationalAntiCorruptionAuthorities: ', documentContent);
      return documentContent;
  } catch (reason) {
      // PDF loading error
      console.error('Error loading PDF: ', reason);
      return documentContent;  // Return an empty array in case of an error
  }
};

export const getYouthLedTalks = () => {
  // YouthLED TALKS: https://grace.unodc.org/grace/en/youth-empowerment/youthled-talks.html
  return []; // TODO
};

export const getTeachersGuideToUsingForumTheatre = () => {
  // A TEACHER’S GUIDE TO USING FORUM THEATRE TO PROMOTE THE RULE OF LAW: https://grace.unodc.org/grace/en/secondary/acting-for-the-rule-of-law.html
  return []; // TODO
};

export const getUniversityModuleSeriesOnAntiCorruption = () => {
  // UNIVERSITY MODULE SERIES ON ANTI-CORRUPTION: https://grace.unodc.org/grace/en/academia/module-series-on-anti-corruption.html
  return []; // TODO
};



