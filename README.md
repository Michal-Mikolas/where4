# Where4: Pinpoint any location with four simple words

**Where4** is a simple system that converts traditional latitude and longitude coordinates into a memorable 4-word address and vice-versa.

**Live Demo:** [**where4.eu**](https://where4.eu)

## What is Where4?

Imagine trying to tell someone your precise location over the phone or radio. Reading out long strings of numbers for latitude and longitude (e.g., "49.7977543° N, 18.2567507° E") can be cumbersome, error-prone, and hard to remember.

Where4 solves this by converting those complex coordinates into a unique combination of four simple, easy-to-pronounce words (e.g., `ROBI SEME NERU RODI` which maps to the example coordinates).

### Why use a 4-word system like Where4?

*   **Simplicity & Memorability:** Four common words are far easier to remember, say, and write down than long decimal numbers.
*   **Reduced Errors:** Transcribing or speaking words leads to fewer errors than with sequences of digits and symbols. This is crucial in situations where accuracy is paramount, like emergencies or coordinating over noisy channels.
*   **Ease of Communication:** Ideal for verbal communication (e.g., radio, phone calls) where reading out coordinates is impractical.
*   **Offline Potential:** The core algorithm can be implemented offline, making it useful in areas with no internet access once the system is understood.
*   **Free & Open-Source:** Where4 is freely available for anyone to use, modify, and contribute to. The code is transparent, fostering trust and community-driven improvements.
*   **International Syllables & Pronunciation:** The syllables used by Where4 are not tied to any single language like English. They have been carefully constructed from letters that are common across a vast majority of world languages, avoiding letters with highly variable or problematic pronunciations (e.g., "Y", "C"). This design aims for maximum readability and mutual intelligibility, regardless of the speaker's or listener's native tongue.
*   **Scalability & Precision:** The Where4 system is inherently scalable. While the default uses four words for a high degree of accuracy (approximately 4 meters), it can be adapted:
    *   **3 Words:** Provides a location accurate to roughly 200 meters, useful for general areas.
    *   **4 Words (Default):** Offers precision to approximately 4 meters, suitable for most navigation and pinpointing needs.
    *   **5 Words:** Increases accuracy to an incredible 10 centimeters, ideal for highly precise applications.

## How does it work? (Coordinates to Words)

The conversion from latitude/longitude to Where4 words involves a few simple steps:

1.  **Unifying Coordinates:**
    *   **Latitude:** Standard latitude ranges from 90°S to 90°N. We convert this to a single range of 0 to 180.
        *   South latitudes (0-90°S) are mapped to 0-90 (e.g., 90°S becomes 0, 0° becomes 90).
        *   North latitudes (0-90°N) are mapped to 90-180 (e.g., 0° becomes 90, 90°N becomes 180).
    *   **Longitude:** Standard longitude ranges from 180°W to 180°E. We convert this to a single range of 0 to 360.
        *   East longitudes (0-180°E) remain 0-180.
        *   West longitudes (0-180°W) are mapped to 180-360 (e.g., 180°W becomes 180, 0° (prime meridian from West) becomes 360).

2.  **Normalization:**
    *   The unified latitude (0-180) is then normalized to a decimal value between 0.0 and 1.0 by dividing by 180.
    *   The unified longitude (0-360) is normalized to a decimal value between 0.0 and 1.0 by dividing by 360.

3.  **Base Conversion (The Magic!):**
    *   These two normalized decimal values (one for latitude, one for longitude) are then treated as fractional numbers in base-10.
    *   We convert the fractional part of each of these normalized numbers into a **base-50** representation.
    *   Instead of using digits 00-49 for our base-50 system, Where4 uses a predefined list of 50 unique two-letter syllables (e.g., BA, BE, BI, ..., TU), designed for international readability.
    *   The conversion process extracts 4 "digits" (syllables) for the latitude and 4 "digits" (syllables) for the longitude. The number of digits extracted can be varied to adjust precision (see "Scalability" above).

4.  **Word Formation:**
    *   The final Where4 address is created by combining these syllables:
        *   Word 1: 1st Latitude Syllable + 1st Longitude Syllable
        *   Word 2: 2nd Latitude Syllable + 2nd Longitude Syllable
        *   Word 3: 3rd Latitude Syllable + 3rd Longitude Syllable
        *   Word 4: 4th Latitude Syllable + 4th Longitude Syllable
        *   (And so on, if more words/syllables are used for higher precision)

The conversion from words back to coordinates follows these steps in reverse.

## Demo

Try out the Where4 converter live:

➡️ [**where4.eu**](https://where4.eu)

You can:
*   Enter latitude/longitude coordinates (in DD, DMS, or DM format) to get a 4-word address.
*   Drag the map to a location, and the coordinates and 4-word address will update.
*   Type in a 4-word address to see its corresponding coordinates and location on the map.

## Get Involved!

Where4 is an open-source project, and your feedback and contributions are highly welcome!

*   **Found a bug or have a suggestion?** Please [open an issue](https://github.com/Michal-Mikolas/where4/issues).
*   **Want to improve the code or add new features?** Feel free to fork the repository and submit a pull request.
*   **Ideas for use cases?** Share them! The more people who find this useful, the better.

Let's make location sharing simpler and more accessible together!