import CountryRegionData, {Country, Region} from 'country-region-data';
import countryRegionData from "country-region-data";


export interface FilterCountriesProps {
    priorityCountries?: string[],
    whitelist?: string[],
    blacklist?: string[]
}

export const getRegions = (countryShortCode: string): Region[] | undefined => CountryRegionData
    .find(country => country.countryShortCode === countryShortCode)?.regions;

export const filterCountries = (props: FilterCountriesProps) => {

    const {priorityCountries, whitelist, blacklist} = props;

    let countriesListedFirst: Country[] = [];
    let filteredCountries: Country[] = [...CountryRegionData];

    if (whitelist && whitelist.length > 0) {
        filteredCountries = filteredCountries.filter((country) => whitelist.indexOf(country.countryShortCode) > -1);
    } else if (blacklist && blacklist.length > 0) {
        filteredCountries = filteredCountries.filter((country) => blacklist.indexOf(country.countryShortCode) === -1);
    }

    if (priorityCountries && priorityCountries.length > 0) {

        // ensure the countries are added in the order in which they are specified by the user
        priorityCountries.forEach((countryShortCode) => {
            const result = filteredCountries.find((country) => country.countryShortCode === countryShortCode);
            if (result) {
                countriesListedFirst.push(result);
            }
        });

        filteredCountries = filteredCountries.filter((country) => priorityCountries.indexOf(country.countryShortCode) === -1);
    }

    return countriesListedFirst.length ? [...countriesListedFirst, ...filteredCountries] : filteredCountries;
};
