import styled from '@emotion/styled'
import { useNavigate } from 'react-router-dom'
import {  MOBILE_BREAKPOINT, Colors, Fonts } from '../../styles/global';
import BgImg from '../../assets/imgs/gradient-background.png'

import { BackgroundImage, Container as ContainerBase } from './components';
import { FeaturedApplicationsContent } from './content'

import Slider from "react-slick";
import '../../assets/slick.min.css'


const FeaturedApps = props => {
  const navigate = useNavigate()
  
    return <Style>
    <Container>

    <Headline>
        <span>
            FEATURED
        </span>
        <br/>
        APPLICATIONS
    </Headline>

        {
            FeaturedApplicationsContent.map( (item, idx) => <FeaturedApp {...item} right={idx%2} />)
        }

    
    </Container>
    <BackgroundImage src={BgImg} zIndex='-2' />
    </Style>
  }

  export default FeaturedApps

  const Container = styled(ContainerBase)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  `

  const Style = styled.div`
  width: 100%;
  height: 100%;
  position: relative;

  display: flex;
  justify-content: center;
  `

  const Headline = styled.p`
  font-family: ${Fonts.headline};
  font-style: normal;
  font-weight: 400;
  font-size: 92px;
  line-height: 94px;
  text-transform: capitalize;

  margin: 0;
  margin-top: 131px;
  margin-left: 87px;

  color: ${Colors.offWhite};

  span {
    font-family: ${Fonts.headline};
    color: ${Colors.lime};
  }

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    max-width: 600px;
    font-size: 38px;
    line-height: 35px;
    margin: 0;
    margin-top: 50px;
    margin-left: 87px;
}`


const FeaturedApp = props => {

    const { title, subtitle, description, img, right, imgs } = props;

    return <GridTwoColumns>
        { (!imgs && !right) ? <FeatureAppImg src={img}/> : <></> }

        <FeaturedAppStyle>
            <h1>
                {title}
            </h1>
            <h2>
                {subtitle}
            </h2>
            <p>
                {description}
            </p>
        </FeaturedAppStyle>
        { (!imgs && right) ? <FeatureAppImg src={img}/> : <></> }
        <SlickSlider imgs={imgs}/>

    </GridTwoColumns>
}
const MediaContainer = styled.div`
max-width: 100%;
height: 100%;
`
const FeaturedAppStyle = styled.div`
display: flex;
flex-direction: column;
align-items: flex-start;
justify-content: center;
gap: 10px;
padding: 0 40px;

h1, h2, p {
    font-family: 'Uncut-Sans-Variable';
}
h1 {
    font-style: normal;
    font-weight: 700;
    font-size: 42px !important;
    line-height: 52px;
    color: ${Colors.offWhite};
    margin: 0;
    margin-bottom: 8px;
}
h2 {
    font-style: normal;
    font-weight: 500;
    font-size: 28px;
    line-height: 35px;
    /* identical to box height */


    /* lime */
    color: ${Colors.lime};

    margin: 0;
    margin-bottom: 30px;
}
p {
    font-style: normal;
    font-weight: 400;
    font-size: 21px;
    line-height: 30px;
    margin: 0;
    /* gray 1 */

    color: ${Colors.gray1};


    /* Inside auto layout */

    flex: none;
    order: 1;
    flex-grow: 0;
}
`
const FeatureAppImg = styled.img`
max-width: 100%;
width: 520px;
height: auto;
padding: 20px;
`

const GridTwoColumns = styled.div`
width: 100%;
max-width: 1110px;
// position: relative;
align-self: center;

display: grid;
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
padding: 0em 1.5em;
gap: 70px;
margin: 75px 0;

@media (max-width: ${MOBILE_BREAKPOINT}) {
  padding: 0em 1.5em;
  margin: 100px 0;
  flex-wrap: wrap;
}
`;




function SlickSlider({ imgs }){
    if (!imgs) return <></>;    
    console.log(imgs)
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        autoplay: true,
      };

    return <Slider {...settings}>
        {
            imgs.map(img=> <FeatureAppImg key={img} src={img}/>)
        }
    </Slider>
}