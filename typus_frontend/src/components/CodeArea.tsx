import React, { useState, useEffect, useRef } from 'react'
import './styles/code-area.sass'
import { CodeCharacter, CodeLine, Cursor } from '../interfaces';
import isCodeSymbol from '../lib/isCodeSymbol';
import useCodeGrid from '../hooks/useCodeGrid';


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

			// TODO: unhardcode this stuff
			if (cX < 97) {
				if (lnsRef.current[cY].chars[cX].c     === ' ' && !lnsRef.current[cY].chars[cX].isFiller     && 
					lnsRef.current[cY].chars[cX + 1].c === ' ' && !lnsRef.current[cY].chars[cX + 1].isFiller &&  
					lnsRef.current[cY].chars[cX + 2].c === ' ' && !lnsRef.current[cY].chars[cX + 2].isFiller &&  
					lnsRef.current[cY].chars[cX + 3].c === ' ' && !lnsRef.current[cY].chars[cX + 3].isFiller) {
				
					lnsRef.current[cY].chars[cX].wasTyped = true;
					lnsRef.current[cY].chars[cX + 1].wasTyped = true;
					lnsRef.current[cY].chars[cX + 2].wasTyped = true;
					lnsRef.current[cY].chars[cX + 3].wasTyped = true;
					console.log(lnsRef);
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
