import { useState, useEffect } from 'react'
import { CodeGrid, CodeLine, CodeCharacter } from '../interfaces';
import { FetchState } from '../interfaces';
import { MAX_LINE_LENGTH } from '../constants';


interface Props {
    /**
     * Parameters of the useCodeSample custom hook.
     * 
     * @property {string} exampleId - A unique id of the example the user wants to retrieve
     * 
     * @interface
     */

    sampleId: string;
}

/**
 * useCodeSample is a custom React hook for convenient data retrieving from the samples API.
 * 
 * @param {Props} props - The hook props.
 * @returns {State} - An object containing the state of a request. 
 * 
 * @function
 */
function useCodeGrid(props: Props): FetchState<CodeGrid> {
    const [state, setState] = useState<FetchState<CodeGrid>>({ status: 'idle', data: null, error: null });

    useEffect(() => {
        setState({ status: 'loading', data: null, error: null });

        const fetchParseData = async () => {
            try {
                const url = `${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:8080/api/samples/${props.sampleId}`;
                const responseData = await fetch(url, {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                if (responseData.status === 200) {
                    const sample = await responseData.json();
                    const lines: CodeLine[] = [];
					let countSymbols: number = 0;

                    for (let i = 0; i < sample.Content.length; i++) {
                        const line: CodeLine = { chars: [] };
						let lineStarted: boolean = false;

						for (let j = 0; j < MAX_LINE_LENGTH; j++) {
							if (j < sample.Content[i].length) {
								
								if (lineStarted) {
									countSymbols++;
								} else if (sample.Content[i][j] != ' ') {
									lineStarted = true;
									countSymbols++;
								}
								const char: CodeCharacter = { c: sample.Content[i][j], isTyped: false, isHighlighted: false, isFiller: false };
								line.chars.push(char);
							} else {
								const char: CodeCharacter = { c: ' ', isTyped: false, isHighlighted: false, isFiller: true };
								line.chars.push(char);
							}
						}
                        lines.push(line);
                    }
					const codeGrid: CodeGrid = { lines: lines, title: sample.Title, langSlug: sample.Language, cntSymbols: countSymbols };
                    setState({ status: 'success', data: codeGrid, error: null })
                } else {
                    setState({ status: 'error', data: null, error: `Could not fulfill the request, code ${responseData.status}` })
                }
            } catch (error) {
                setState({ status: 'error', data: null, error: "Could not fetch data from API" })
            }
        }

        fetchParseData();
    }, []);

    return state;
}

export default useCodeGrid;
