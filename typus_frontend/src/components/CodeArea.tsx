import React, { useState, useEffect, useRef } from 'react'
import './styles/code-area.sass'
import { CodeCharacter, CodeLine, Cursor } from '../interfaces';
import isCodeSymbol from '../lib/isCodeSymbol';
import useCodeGrid from '../hooks/useCodeGrid';
import { TAB_SIZE, MAX_LINE_LENGTH } from '../constants';


interface Props {
    sampleId: string;
}


function CodeArea(props: Props): JSX.Element {
    const { status, data, error } = useCodeGrid({ sampleId: props.sampleId });
    const [lines, _setLines] = useState<CodeLine[]>([]);
    const [csr, _setCsr] = useState<Cursor>({ x: 0, y: 0});

    const lnsRef = useRef(lines);
    const csrRef = useRef(csr);

    const setLines = (data: CodeLine[]): void => {
        lnsRef.current = data;
        _setLines(data);
    }
    const setCsr = (data: Cursor): void => {
        csrRef.current = data;
        _setCsr(data);
    }

    useEffect(() => {
        if (status === 'success') {
            setLines(data);
        }
        document.addEventListener("keydown", handleKeyboard);

        return () => {
            document.removeEventListener("keydown", handleKeyboard);
        }
    }, [data]);

    const handleKeyboard = (event: KeyboardEvent): void => {
		const [cX, cY] = [csrRef.current.x, csrRef.current.y];

		if (isCodeSymbol(event.key) && cX < lnsRef.current[cY].chars.length && !lnsRef.current[cY].chars[cX].isFiller) {
            const currentSymbolToType = lnsRef.current[cY].chars[cX].c;
            if (event.key === currentSymbolToType) {
                lnsRef.current[cY].chars[cX].wasTyped = true;
                setCsr({x: cX + 1, y: cY });
            }   
        } else if (event.key === "Enter" && cY < lnsRef.current.length - 1 && 
                    lnsRef.current[cY].chars[cX].isFiller) {
            setCsr({ x: 0, y: cY + 1 });
		} else if (event.key === "Tab") {
			event.preventDefault();
			if (cX <= MAX_LINE_LENGTH - TAB_SIZE) {

				const tabSlice = lnsRef.current[cY].chars.slice(cX, cX + TAB_SIZE);
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
                    lines?.map((line: CodeLine, lineNumber: number) => {
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
                                            lines[lineNumber].chars.map((char: CodeCharacter, charIndex: number) => {
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
