/**
 * Where4 - A JavaScript class for converting between geographic coordinates and word sequences
 * using a syllable-based encoding system. This class provides methods to convert
 * latitude/longitude coordinates into memorable word sequences and vice versa.
 * 
 * The encoding uses a base-50 syllable system to efficiently represent decimal
 * coordinates with high precision. Each syllable represents a digit in the base-50
 * system, allowing for compact representation of geographic locations.
 * 
 * Features:
 * - Converts coordinates in various formats (DD, DM, DMS) to word sequences
 * - Converts word sequences back to geographic coordinates
 * - Provides detailed processing information for debugging and education
 * - Handles hemisphere indicators (N/S/E/W) appropriately
 * - Validates input coordinates for geographic validity
 * 
 * Usage:
 * const where4 = new Where4();
 * const result = where4.processCoordinates("40.7128° N 74.0060° W");
 * // Returns a word sequence representing the coordinates
 * 
 * const coords = where4.processWords("WORD SEQUENCE HERE");
 * 
 * @author Michal Mikolas (linkedin.com/in/michal-mikolas)
 * @see github.com/Michal-Mikolas/where4
 * @license MIT
 */
class Where4 { 
    #syllables = {
        0: 'BA', 1: 'BE', 2: 'BI', 3: 'BO', 4: 'BU', 5: 'DA', 6: 'DE', 7: 'DI', 8: 'DO', 9: 'DU',
        10: 'FA', 11: 'FE', 12: 'FI', 13: 'FO', 14: 'FU', 15: 'GA', 16: 'GE', 17: 'GI', 18: 'GO', 19: 'GU',
        20: 'KA', 21: 'KE', 22: 'KI', 23: 'KO', 24: 'KU', 25: 'MA', 26: 'ME', 27: 'MI', 28: 'MO', 29: 'MU',
        30: 'NA', 31: 'NE', 32: 'NI', 33: 'NO', 34: 'NU', 35: 'RA', 36: 'RE', 37: 'RI', 38: 'RO', 39: 'RU',
        40: 'SA', 41: 'SE', 42: 'SI', 43: 'SO', 44: 'SU', 45: 'TA', 46: 'TE', 47: 'TI', 48: 'TO', 49: 'TU'
    };
    #reverseSyllables = {};

    constructor() {
        this.#populateReverseSyllables();
    }

    #populateReverseSyllables() {
        for (const digit in this.#syllables) {
            this.#reverseSyllables[this.#syllables[digit]] = parseInt(digit, 10);
        }
    }

    #convertDecimalToNBaseSyllables(value, base, numDigits) {
        let resultSyllableArray = [];
        let currentFractionalValue = value;
        for (let i = 0; i < numDigits; i++) {
            currentFractionalValue *= base;
            let digitIndex = Math.floor(currentFractionalValue);
            if (digitIndex >= base) digitIndex = base - 1;
            if (digitIndex < 0) digitIndex = 0;
            resultSyllableArray.push(this.#syllables[digitIndex]);
            currentFractionalValue -= digitIndex; 
        }
        return resultSyllableArray;
    }

    _initProcessingDetails(details, rawInput, isReverse = false) {
        if (details) {
            details.rawInput = rawInput;
            details.error = null;
            if (isReverse) {
                details.conversionType = "Words to Coordinates";
                details.parsedWordsArray = null;
                details.latSyllableArray = null;
                details.lngSyllableArray = null;
                details.latDigitArray = null;
                details.lngDigitArray = null;
                details.finalDecoded = null;
            } else {
                details.conversionType = "Coordinates to Words";
                details.detectedFormat = "Unknown";
                details.convertedDdString = null;
                details.parsed = null;
                details.syllablesData = null;
            }
            details.mapCoords = null;
            details.unifiedStage1 = null;
            details.normalizedStage2 = null;
        }
    }
    
    processCoordinates(coordString, processingDetails = null) {
        this._initProcessingDetails(processingDetails, coordString, false); 
        let ddLat, ddLng, latHemisphere, lngHemisphere;
        
        // UPDATED Regexes to allow optional comma separator
        const dmsRegex = /^(\d{1,3})°\s*(\d{1,2})'\s*(\d{1,2}(?:\.\d*)?)(?:"|'')\s*([NSns])(?:\s*,\s*|\s+)(\d{1,3})°\s*(\d{1,2})'\s*(\d{1,2}(?:\.\d*)?)(?:"|'')\s*([EWew])$/i;
        const dmRegex = /^(\d{1,3})°\s*(\d{1,2}\.\d+)'\s*([NSns])(?:\s*,\s*|\s+)(\d{1,3})°\s*(\d{1,2}\.\d+)'\s*([EWew])$/i;
        
        let matches = coordString.match(dmsRegex);
        if (matches) {
            if (processingDetails) processingDetails.detectedFormat = "DMS";
            const [, latDegreesStr, latMinutesStr, latSecondsStr, rawLatHem, lngDegreesStr, lngMinutesStr, lngSecondsStr, rawLngHem] = matches;
            
            ddLat = parseFloat(latDegreesStr) + (parseFloat(latMinutesStr) / 60) + (parseFloat(latSecondsStr || "0") / 3600);
            latHemisphere = rawLatHem.toUpperCase();
            ddLng = parseFloat(lngDegreesStr) + (parseFloat(lngMinutesStr) / 60) + (parseFloat(lngSecondsStr || "0") / 3600);
            lngHemisphere = rawLngHem.toUpperCase();

            if (processingDetails) processingDetails.convertedDdString = `${ddLat.toFixed(8)}° ${latHemisphere} ${ddLng.toFixed(8)}° ${lngHemisphere}`;
            return this._convertDdInputToWords(ddLat, latHemisphere, ddLng, lngHemisphere, processingDetails);
        } else {
            matches = coordString.match(dmRegex);
            if (matches) {
                if (processingDetails) processingDetails.detectedFormat = "DM";
                const [, latDegreesStr, latMinutesStr, rawLatHem, lngDegreesStr, lngMinutesStr, rawLngHem] = matches;
                ddLat = parseFloat(latDegreesStr) + (parseFloat(latMinutesStr) / 60);
                latHemisphere = rawLatHem.toUpperCase();
                ddLng = parseFloat(lngDegreesStr) + (parseFloat(lngMinutesStr) / 60);
                lngHemisphere = rawLngHem.toUpperCase();
                if (processingDetails) processingDetails.convertedDdString = `${ddLat.toFixed(8)}° ${latHemisphere} ${ddLng.toFixed(8)}° ${lngHemisphere}`;
                return this._convertDdInputToWords(ddLat, latHemisphere, ddLng, lngHemisphere, processingDetails);
            } else {
                if (processingDetails) processingDetails.detectedFormat = "DD (assumed)";
                return this._convertDdInputToWords(coordString, null, null, null, processingDetails);
            }
        }
    }

    _convertDdInputToWords(latInput, latDirInput, lngInput, lngDirInput, processingDetails) {
        let latVal, latDir, lngVal, lngDir;
        if (typeof latInput === 'number' && latDirInput && typeof lngInput === 'number' && lngDirInput) {
            latVal = Math.abs(latInput); 
            latDir = latDirInput.toUpperCase();
            lngVal = Math.abs(lngInput);
            lngDir = lngDirInput.toUpperCase();
             if (processingDetails) {
                processingDetails.parsed = { latVal, latDir, lngVal, lngDir };
            }
        } else if (typeof latInput === 'string') {
            // UPDATED ddRegex to allow optional comma separator
            const ddRegex = /^(\d+\.?\d*)°\s*([NSns])(?:\s*,\s*|\s+)(\d+\.?\d*)°\s*([EWew])$/i;
            const ddMatches = latInput.match(ddRegex); 
            if (!ddMatches) { 
                const errorMsg = "Error: Invalid coordinate format.\nSupported: DD.D° H, DD.D° H or DD°MM.M' H, DD°MM.M' H or DD°MM'SS\" H, DD°MM'SS\" H (or SS'')";
                if (processingDetails) processingDetails.error = errorMsg;
                return { words: null, mapCoordinates: null, error: errorMsg };
            }
            latVal = parseFloat(ddMatches[1]);
            latDir = ddMatches[2].toUpperCase();
            lngVal = parseFloat(ddMatches[3]);
            lngDir = ddMatches[4].toUpperCase();
            if (processingDetails) {
                processingDetails.parsed = { latVal, latDir, lngVal, lngDir };
                if (processingDetails.detectedFormat === "DD (assumed)") {
                    processingDetails.detectedFormat = "DD";
                }
            }
        } else {
             const errorMsg = "Internal Error: Invalid arguments to _convertDdInputToWords.";
             if (processingDetails) processingDetails.error = errorMsg;
             return { words: null, mapCoordinates: null, error: errorMsg };
        }

        if (latVal < 0 || latVal > 90) {
            const errorMsg = `Error: Latitude value (${latVal.toFixed(5)}°) is out of range (0-90).`;
            if (processingDetails) processingDetails.error = errorMsg;
            return { words: null, mapCoordinates: null, error: errorMsg };
        }
        if (lngVal < 0 || lngVal > 180) {
            const errorMsg = `Error: Longitude value (${lngVal.toFixed(5)}°) is out of range (0-180).`;
            if (processingDetails) processingDetails.error = errorMsg;
            return { words: null, mapCoordinates: null, error: errorMsg };
        }
        
        const originalMapLat = (latDir === 'S') ? -latVal : latVal; 
        const originalMapLng = (lngDir === 'W') ? -lngVal : lngVal; 
        if (processingDetails) processingDetails.mapCoords = { lat: originalMapLat, lng: originalMapLng };

        let unifiedLat; if (latDir === 'S') unifiedLat = -1 * latVal + 90; else unifiedLat = latVal + 90; 
        let unifiedLng; if (lngDir === 'W') unifiedLng = -1 * lngVal + 360; else unifiedLng = lngVal; 
        if (processingDetails) processingDetails.unifiedStage1 = { lat: unifiedLat, lng: unifiedLng };

        const lat_normalized = unifiedLat / 180; 
        const lng_normalized = unifiedLng / 360; 
        if (processingDetails) {
            processingDetails.normalizedStage2 = { lat: lat_normalized, lng: lng_normalized };
        }

        const latSyllableArray = this.#convertDecimalToNBaseSyllables(lat_normalized, 50, 4); 
        const lngSyllableArray = this.#convertDecimalToNBaseSyllables(lng_normalized, 50, 4); 
        
        if (processingDetails) {
            processingDetails.syllablesData = { 
                latArray: latSyllableArray, latString: latSyllableArray.join(''),
                lngArray: lngSyllableArray, lngString: lngSyllableArray.join('')
            };
        }
        
        let outputWordsArray = []; 
        if (latSyllableArray.length === 4 && lngSyllableArray.length === 4) {
            for (let i = 0; i < 4; i++) outputWordsArray.push(latSyllableArray[i] + lngSyllableArray[i]);
            return { 
                words: outputWordsArray.join(' '), 
                mapCoordinates: { lat: originalMapLat, lng: originalMapLng }, error: null 
            };
        } else {
            const errorMsg = "Error generating syllable arrays."; 
            if (processingDetails) processingDetails.error = errorMsg;
            return { words: null, mapCoordinates: null, error: errorMsg };
        }
    }

    #convertNBaseDigitsToDecimal(digitArray, base) {
        let value = 0.0;
        for (let i = 0; i < digitArray.length; i++) {
            value += digitArray[i] / Math.pow(base, i + 1);
        }
        return value;
    }

    wordsToLatLng(wordsString, processingDetails = null) {
        this._initProcessingDetails(processingDetails, wordsString, true); 

        const wordsArray = wordsString.trim().toUpperCase().split(' ');
        if (processingDetails) processingDetails.parsedWordsArray = wordsArray;

        if (wordsArray.length !== 4) {
            const errorMsg = "Error: Input must contain exactly 4 words separated by spaces.";
            if (processingDetails) processingDetails.error = errorMsg;
            return { ddString: null, mapCoordinates: null, error: errorMsg };
        }

        const latSyllables = [];
        const lngSyllables = [];
        const latDigits = [];
        const lngDigits = [];

        for (const word of wordsArray) {
            if (word.length !== 4) {
                const errorMsg = `Error: Each word must be 4 characters long. Word "${word}" is not.`;
                if (processingDetails) processingDetails.error = errorMsg;
                return { ddString: null, mapCoordinates: null, error: errorMsg };
            }
            const latSyl = word.substring(0, 2);
            const lngSyl = word.substring(2, 4);

            if (!(latSyl in this.#reverseSyllables)) {
                const errorMsg = `Error: Invalid latitude syllable "${latSyl}" in word "${word}".`;
                if (processingDetails) processingDetails.error = errorMsg;
                return { ddString: null, mapCoordinates: null, error: errorMsg };
            }
            if (!(lngSyl in this.#reverseSyllables)) {
                const errorMsg = `Error: Invalid longitude syllable "${lngSyl}" in word "${word}".`;
                if (processingDetails) processingDetails.error = errorMsg;
                return { ddString: null, mapCoordinates: null, error: errorMsg };
            }
            latSyllables.push(latSyl);
            lngSyllables.push(lngSyl);
            latDigits.push(this.#reverseSyllables[latSyl]);
            lngDigits.push(this.#reverseSyllables[lngSyl]);
        }

        if (processingDetails) {
            processingDetails.latSyllableArray = latSyllables;
            processingDetails.lngSyllableArray = lngSyllables;
            processingDetails.latDigitArray = latDigits;
            processingDetails.lngDigitArray = lngDigits;
        }

        const lat_normalized = this.#convertNBaseDigitsToDecimal(latDigits, 50);
        const lng_normalized = this.#convertNBaseDigitsToDecimal(lngDigits, 50);
        if (processingDetails) {
            processingDetails.normalizedStage2 = { lat: lat_normalized, lng: lng_normalized };
        }

        let unifiedLat = lat_normalized * 180;
        let unifiedLng = lng_normalized * 360;
        const epsilon = 1e-9; 
        if (Math.abs(lat_normalized - 1.0) < epsilon) unifiedLat = 180.0;
        if (Math.abs(lng_normalized - 1.0) < epsilon) unifiedLng = 360.0;

        if (processingDetails) {
            processingDetails.unifiedStage1 = { lat: unifiedLat, lng: unifiedLng };
        }
        
        let finalLat, finalLatH, finalLng, finalLngH;

        if (unifiedLat < 90.0) { 
            finalLat = 90.0 - unifiedLat;
            finalLatH = 'S';
        } else { 
            finalLat = unifiedLat - 90.0;
            finalLatH = 'N';
        }

        if (unifiedLng > 180.0 && unifiedLng < 360.0) { 
            finalLng = 360.0 - unifiedLng;
            finalLngH = 'W';
        } else { 
            finalLng = unifiedLng;
             if (finalLng >= 360.0) finalLng = 0.0; 
            finalLngH = 'E';
        }
        
        finalLat = Math.abs(finalLat);
        finalLng = Math.abs(finalLng);
        if (finalLng === 180.0) finalLngH = 'E';

        if (processingDetails) {
            processingDetails.finalDecoded = {
                lat: finalLat, latH: finalLatH,
                lng: finalLng, lngH: finalLngH
            };
        }

        const ddOutputString = `${finalLat.toFixed(7)}° ${finalLatH} ${finalLng.toFixed(7)}° ${finalLngH}`;
        
        const mapLat = (finalLatH === 'S') ? -finalLat : finalLat;
        const mapLng = (finalLngH === 'W') ? -finalLng : finalLng;
        if (processingDetails) {
            processingDetails.mapCoords = { lat: mapLat, lng: mapLng };
        }

        return {
            ddString: ddOutputString,
            mapCoordinates: { lat: mapLat, lng: mapLng },
            error: null
        };
    }
} // End of Where4 class
