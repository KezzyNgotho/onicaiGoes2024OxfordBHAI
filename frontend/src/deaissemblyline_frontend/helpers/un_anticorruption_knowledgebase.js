import { unConventionAgainstCorruptionArray } from "./UN_AntiCorruption_Materials/unConventionAgainstCorruption";

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

export const getUnConventionAgainstCorruption = () => {
  // UNITED NATIONS CONVENTION AGAINST CORRUPTION: https://unodc.org/documents/treaties/UNCAC/Publications/Convention/08-50026_E.pdf
  return unConventionAgainstCorruptionArray;
};

export const getPolicyGuideForNationalAntiCorruptionAuthorities = () => {
  // POLICY GUIDE FOR NATIONAL ANTI-CORRUPTION AUTHORITIES ON MEANINGFUL YOUTH ENGAGEMENT IN ANTI-CORRUPTION WORK: https://grace.unodc.org/grace/en/youth-empowerment/policy-guide-for-national-anti-corruptionauthorities-on-meaningful-youth-engagement-in-anti-corruption-work.html
  return []; // TODO
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



