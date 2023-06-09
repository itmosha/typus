import React, { useState, useEffect, useRef } from 'react'
import './styles/code-area.sass'
import { CodeGrid, CodeLine, CodeCharacter, Cursor } from '../interfaces';
import isCodeSymbol from '../lib/isCodeSymbol';
import useCodeGrid from '../hooks/useCodeGrid';
import { CiSettings, CiStopwatch, CiEdit } from 'react-icons/ci';
import { LANGUAGES, TAB_SIZE, MAX_LINE_LENGTH } from '../constants';


interface Props {
    sampleId: string;
}

function CodeArea(props: Props): JSX.Element {
    const { status, data, error } = useCodeGrid({ sampleId: props.sampleId });
	const [grid, _setGrid] = useState<CodeGrid>({ lines: [], title: '', langSlug: '', cntSymbols: 0 });
    const [csr, _setCsr] = useState<Cursor>({ x: 0, y: 0});
	const [isRunning, setIsRunning] = useState<boolean>(false);
	const [showScore, setShowScore] = useState<boolean>(false);
	const [secPassed, setSecPassed] = useState<number>(0);
	const [cntSymbTyped, setCntSymbTyped] = useState<number>(0);

    const gridRef = useRef(grid);
    const csrRef = useRef(csr);
	const rafRef = useRef<number | null>(null);

	const setGrid = (data: CodeGrid): void => {
        gridRef.current = data;
        _setGrid(data);
    }
	
    const setCsr = (data: Cursor): void => {
        csrRef.current = data;
        _setCsr(data);
    }

	const homePage = (): void => {
		window.location.replace(`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_FRONTEND_PORT}/`)
	}

	const startStopwatch = (): void => {
		if (!isRunning) {
			setIsRunning(true);
			rafRef.current = requestAnimationFrame(updateStopwatch);
		}
	}

	const stopStopwatch = (): void => {
		if (isRunning) {
			setIsRunning(false);
			cancelAnimationFrame(rafRef.current!);
		}
	}

	const resetStopwatch = (): void => {
		stopStopwatch();
		setSecPassed(0);
	}

	const updateStopwatch = (timestamp: number): void => {
		setSecPassed((prevSecPassed: number) => {
			const delta = timestamp - prevSecPassed;
			return Math.floor((prevSecPassed + delta) / 1000);
		});
		rafRef.current = requestAnimationFrame(updateStopwatch);
	}

	const reset = (): void => {
		// TODO: implement this properly
		window.location.reload();
	}

    useEffect(() => {
        if (status === 'success') {
            setGrid(data);
        }

        document.addEventListener("keydown", handleKeyboard);

        return () => {
            document.removeEventListener("keydown", handleKeyboard);
        }
    }, [data, cntSymbTyped, isRunning, secPassed, grid]);

    const handleKeyboard = (event: KeyboardEvent): void => {

		// Quit if the sample is done
		
		if (cntSymbTyped === grid.cntSymbols) return;

		const [cX, cY] = [csrRef.current.x, csrRef.current.y];
		const [lines, lang] = [gridRef.current.lines, gridRef.current.langSlug];

		// Start the stopwatch when any key is pressed
		
		if (!isRunning) {
			startStopwatch();
		}

		// Handle typing a regular code character
		//
		// Checks performed:
		//     1. Entered symbol is a valid code character
		//     2. Current line is not fully typed yet
		//     3. Next character is not a filler
		
		if (isCodeSymbol(event.key) && cX < lines[cY].chars.length && !lines[cY].chars[cX].isFiller) {
			
			// Find the symbol that needs to be entered
            const currentSymbolToType = lines[cY].chars[cX].c;

			// If the entered one is right then mark it as typed in the grid and update the cursor position
			// Also increment the symbol counter
            if (event.key === currentSymbolToType) {
                lines[cY].chars[cX].isTyped = true;
                setCsr({x: cX + 1, y: cY });
				setCntSymbTyped(cntSymbTyped + 1);
				
				if (cntSymbTyped + 1 === grid.cntSymbols) {
					stopStopwatch();
					setShowScore(true);
				}
            }   

		// Handle ENTER key
		//
		// Checks performed:
		//     1. Entered key is enter
		//     2. Current line is not the last line
		//     3. Next character is a filler

        } else if (event.key === "Enter" && cY < lines.length - 1 && lines[cY].chars[cX].isFiller) {
			
			// Initial identation size
			let ident: number = 0;
			
			// Check if the next line is not empty
			if (!lines[cY + 1].chars[0].isFiller) {

				// Find how many spaces appear before the first actual symbol
				for (let i = 0; i < MAX_LINE_LENGTH; i++) {
					if (lines[cY + 1].chars[i].c === ' ') {
						ident++;
					} else break;
				}
			}

			// Change states of lines and the cursor
			const identSlice = lines[cY + 1].chars.slice(0, ident);
			identSlice.forEach((_, index) => identSlice[index].isTyped = true);
			setCsr({ x: ident, y: cY + 1 });

		// Handle TAB key
		} else if (event.key === "Tab") {

			// Disable default TAB key behaviour
			event.preventDefault();

			// Check for the maximum line length
			if (cX <= MAX_LINE_LENGTH - TAB_SIZE) {

				// Get a slice of the elements which will be affected by the tab
				const tabSlice = gridRef.current.lines[cY].chars.slice(cX, cX + TAB_SIZE);

				// Perform checks:
				//     1. All tabbed characters are spaces
				//     2. All tabbed characted are not fillers
				const isAllSpaces = tabSlice.every((char) => char.c === ' ');
				const isAllNotFillers = tabSlice.every((char) => !char.isFiller);
					
				// If everything's fine change state of lines and the cursor
				if (isAllSpaces && isAllNotFillers) {
					tabSlice.forEach((_, index) => tabSlice[cX + index].isTyped = true);
					setCsr({ x: cX + 4, y: cY });
				}
			}
		} else if (event.key === "Escape") {

			// Restart the game
			// TODO: implement this properly
			
			window.location.reload();
		}
    }

    return (
        <>
			{ showScore ? (
				<div className='dark-bg'>
					<div className='score-window'>
						<h1 className='score-window-heading'>Your score</h1>
						<h2 className='score-window-time'>Time: { secPassed } seconds</h2>
						<div className='score-window-buttons'>
							<button className='score-window-retry-button' onClick={() => reset()}>Try again</button>
							<button className='score-window-menu-button' onClick={() => { reset(); homePage(); }}>Menu</button>
						</div>
					</div>
				</div>
			) : null }
			<div className='code-area-header-wrapper'>

				<button className='code-area-logo-button' onClick={() => homePage()}>
					<h1 className='code-area-logo-text'>
						Typus
					</h1>
				</button>
				<div className='code-area-info-section'>
					<h2 className='stopwatch-text'>
						{ secPassed }
					</h2>
					<CiStopwatch size='30px' className='code-area-info-icon' />
					<hr className='code-area-info-section-splitter' />
					<CiEdit size='30px' className='code-area-info-icon' />
					<h2 className='counter-text'>
						{ cntSymbTyped }/{ grid.cntSymbols }
					</h2>
				</div>
				<div className='code-area-icons-section'>
					<CiSettings size='30px' className='code-area-icon' />
				</div>
			</div>
            <div className='code-area-wrapper'>
                <div className='code-area-top-gap'>
                    <div className='code-area-filler-line-numbers'></div>
                </div>
                {
                    grid.lines?.map((line: CodeLine, lineNumber: number) => {
                        return (
                            <div className='code-area-line' key={lineNumber}>
                                <div className='code-area-line-number-wrapper'>
                                    <span className='code-area-line-number'>
                                        { lineNumber + 1 }
                                    </span>
                                </div>
                                { error ? (
                                    <h1>An error ocurred: { error }</h1>
                                ) : (
                                    <div className='code-line-wrapper'>
                                        {    
                                            grid.lines[lineNumber].chars.map((char: CodeCharacter, charIndex: number) => {
                                                return (
                                                    <div style={{ display: 'flex' }} key={`${lineNumber}:${charIndex}`}>
                                                        <div style={{ display: 'flex'}}>
                                                            <span className='code-line' style={{ opacity: `${char.isTyped ? '1' : '0.5'}` }}>
                                                                { char.c }
                                                            </span>
                                                            { csr.x === charIndex && csr.y === lineNumber ? (
                                                                <span className='code-area-cursor'></span>
                                                            ) : null }
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                )}
                            </div>
                        )
                    })
                }
                <div className='code-area-filler'>
                    <div className='code-area-filler-line-numbers'></div>
                </div>
            </div>
			<div className='code-area-footer'>
				{ LANGUAGES.has(grid?.langSlug) ? (
					<div className='code-area-footer-lang-wrapper'>
						<img src={`/langs/${grid.langSlug}.svg`} className='code-area-footer-lang-logo' />
						<h2 className='code-area-footer-lang-text'>{ LANGUAGES.get(grid.langSlug) }</h2>
					</div>
				) : <div></div> }
				<div>
				<h2 className='code-area-footer-sample-name'>{ grid?.title }</h2>
				</div><div className='temporary'></div>
			</div>
        </>
    )
}

export default CodeArea;
