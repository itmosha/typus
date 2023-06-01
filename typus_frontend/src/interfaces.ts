export interface CodeCharacter {
    /**
     * This interface represents a single character of code.
     * 
     * @property {string}  c             - The character itself.
     * @property {boolean} wasTyped      - Represents if the character was already typed by a user. Should be false by default.
     * @property {boolean} isHighlighted - Determines if the character is highlighted. 
     *                                     This property is used for marking a character if it was typed incorrectly.
	 * @property {boolean} isFiller      - Determines if the character is a filler character.
     * @interface
     */

    c: string;
    isTyped: boolean;
    isHighlighted: boolean;
	isFiller: boolean;
}

export interface CodeLine {
    /**
     * This interface represents a line of code.
     * 
     * @property {CodeCharacter[]} chars - Stores an array of characters to type.
     * 
     * @interface
     */

    chars: CodeCharacter[];
}

export interface CodeGrid {
	/**
	 * This interface represents a code sample grid.
	 *
	 *	@property {CodeLine[]} lines - Stores all the code lines.
	 *	@property {string} langSlug - Language slug that is code written in.
	 *	@property {number} cntSymbols - Amount of symbols in code sample.
	 * 	
	 *	@interface
	 */
	
	lines: CodeLine[];
	langSlug: string;
	cntSymbols: number;
}

export interface Cursor {
    /**
     * This interface represents a cursor which is used in a code field.
     * 
     * @property {number} x - Coordinate by the X-axis
     * @property {number} y - Coordinate by the Y-axis
     * 
     * @interface
     */

    x: number;
    y: number;
}

export interface SampleCard {
    /**
     * This interface represents a code sample data which is displayed in samples page.
     * 
     * @property {string} sampleId - ID of the sample.
     * @property {string} title    - Name of the sample.
     * @property {string} langSlug - Short name of the programming language that sample is written in.
     *                               Essentialy it is the file extension, such as .py for Python or .ts for TypeScript
     * @interface
     */

    sampleId: string;
    title: string;
    langSlug: string;
}

/**
 * The state of a custom React hook that fetches data from API.
 * 
 * @property {string} status        - The current state of data fetching/parsing process.
 * @property {T | null} data        - Data that was already fetched and parsed.
 * @property {string | null} error  - Storing possible errors.
 * 
 * @typedef {Object} State
 */
export type FetchState<T> =
    | { status: 'idle', data: null, error: null }
    | { status: 'loading', data: null, error: null }
    | { status: 'success', data: T, error: null }
    | { status: 'error', data: null, error: string }
