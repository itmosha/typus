import React from 'react'
import { BiReset } from 'react-icons/bi'
import './styles/code-area-header.sass'


interface Props {}

const CodeAreaHeader: React.FC<{}> = (props: Props): JSX.Element => {

	const homePage = () => {
		window.location.replace(`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_FRONTEND_PORT}/`)
	}

    return (
        <div className='code-area-header-wrapper'>

			<button className='code-area-logo-button' onClick={() => homePage()}>
				<h1 className='code-area-logo-text'>
					Typus
				</h1>
			</button>
        </div>
    );
}

export default CodeAreaHeader;
