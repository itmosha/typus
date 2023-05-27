import React, { useState, useEffect, useRef } from 'react'
import './styles/code-area.sass'
import { CodeGrid, CodeLine, CodeCharacter, Cursor } from '../interfaces';
import isCodeSymbol from '../lib/isCodeSymbol';
import useCodeGrid from '../hooks/useCodeGrid';
import { TAB_SIZE, MAX_LINE_LENGTH } from '../constants';


interface Props {
    sampleId: string;
}


function CodeArea(props: Props): JSX.Element {
    const { status, data, error } = useCodeGrid({ sampleId: props.sampleId });
	const [grid, _setGrid] = useState<CodeGrid>({ lines: [], langSlug: '' });
    const [csr, _setCsr] = useState<Cursor>({ x: 0, y: 0});

    const gridRef = useRef(grid);
    const csrRef = useRef(csr);

	const setGrid = (data: CodeGrid): void => {
        gridRef.current = data;
        _setGrid(data);
    }
    const setCsr = (data: Cursor): void => {
        csrRef.current = data;
        _setCsr(data);
    }

    useEffect(() => {
        if (status === 'success') {
            setGrid(data);
        }
        document.addEventListener("keydown", handleKeyboard);

        return () => {
            document.removeEventListener("keydown", handleKeyboard);
        }
    }, [data]);

    const handleKeyboard = (event: KeyboardEvent): void => {
		const [cX, cY] = [csrRef.current.x, csrRef.current.y];

		if (isCodeSymbol(event.key) && cX < gridRef.current.lines[cY].chars.length && !gridRef.current.lines[cY].chars[cX].isFiller) {
            const currentSymbolToType = gridRef.current.lines[cY].chars[cX].c;
            if (event.key === currentSymbolToType) {
                gridRef.current.lines[cY].chars[cX].wasTyped = true;
                setCsr({x: cX + 1, y: cY });
            }   
        } else if (event.key === "Enter" && cY < gridRef.current.lines.length - 1 && gridRef.current.lines[cY].chars[cX].isFiller) {
            setCsr({ x: 0, y: cY + 1 });
		} else if (event.key === "Tab") {
			event.preventDefault();
			if (cX <= MAX_LINE_LENGTH - TAB_SIZE) {

				const tabSlice = gridRef.current.lines[cY].chars.slice(cX, cX + TAB_SIZE);
				const isAllSpaces = tabSlice.every((char) => char.c === ' ');
				const isAllNotFillers = tabSlice.every((char) => !char.isFiller);
					
				if (isAllSpaces && isAllNotFillers) {
					tabSlice.forEach((_, index) => tabSlice[cX + index].wasTyped = true);
					setCsr({ x: cX + 4, y: cY });
				}
			}
		}
    }


    return (
        <>
            <div className='code-area-wrapper'>
                <div className='top-gap'>
                    <div className='filler-line-numbers'></div>
                    <div className='filler-code'></div>
                </div>
                {
                    grid.lines?.map((line: CodeLine, lineNumber: number) => {
                        return (
                            <div className='line' key={lineNumber}>
                                <div className='line-number-wrapper'>
                                    <span className='line-number'>
                                        { lineNumber + 1 }
                                    </span>
                                </div>
                                { error ? (
                                    <h1>An error ocurred: { error }</h1>
                                ) : (
                                    <div className='line-code-wrapper'>
                                        {    
                                            grid.lines[lineNumber].chars.map((char: CodeCharacter, charIndex: number) => {
                                                return (
                                                    <div style={{ display: 'flex' }} key={`${lineNumber}:${charIndex}`}>
                                                        <div style={{ display: 'flex'}}>
                                                            <span className='line-code' style={{ opacity: `${char.wasTyped ? '1' : '0.5'}` }}>
                                                                { char.c }
                                                            </span>
                                                            { csr.x === charIndex && csr.y === lineNumber ? (
                                                                <span className='cursor'></span>
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
                <div className='filler'>
                    <div className='filler-line-numbers'></div>
                    <div className='filler-code'></div>
                </div>
            </div>
        </>
    )
}

export default CodeArea;
