import React from 'react';
import './styles/sample-card.sass';


interface Props {
	sampleId: string;
	title: string;
	language: string;
}

function SampleListCard(props: Props) {
	return (
		<div
			className='sample-card-wrapper' 
			onClick={() => window.location.replace(`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:3000/samples/${props.sampleId}`)}
		>
			<h1 className='sample-card-title'>{ props.title }</h1>
			<div className='sample-card-language-wrapper'>
				<img src={`/langs/${props.language}.svg`} className='sample-card-language' />
			</div>
		</div>
	);
}

export default SampleListCard;
