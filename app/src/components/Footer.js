import { Container, Link, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { NavLink } from "react-router-dom"
import { SocialLinks } from "./Social"
import { Colors, MOBILE_BREAKPOINT, HUGE_BREAKPOINT, BaseContainer } from "../styles/global"
import { LinkStyle } from "../pages/Home/components"
import DescriptionIcon from "@mui/icons-material/Description"
import { ImageURLHeading } from "../pages/Home/styles"

const Footer = () => {
  return (
    <OuterContainer>
      <FooterStyle>
        <LetsTalkStyle>
          Let's talk
          <br />
          <StyledLink href="mailto:hello@pollinations.ai">
            <b>hello@pollinations.ai</b>
          </StyledLink>
        </LetsTalkStyle>
        <SocialContainer>
          <SocialLinks small gap='1em' invert />
        </SocialContainer>
        <LogoContainer>
          <NavLink to="/">
            <ImageURLHeading
              whiteText={false}
              width={250}
              height={100}
              customPrompt={`an image with the text "Pollinations" displayed in an elegant, decorative serif font. The font has high contrast between thick and thin strokes, that give the text a sophisticated and stylized appearance. The text is in black, set against a solid white background, creating a striking and bold visual contrast. Incorporate elements related to pollinations, digital circuitry, such as flowers, chips, insects, wafers, and other organic forms into the design of the font. Each letter features unique, creative touches that make the typography stand out. Incorporate elements related to pollinations, digital circuitry, and organic forms into the design of the font. The text should take all the space without any margins.`}
            />
          </NavLink>
        </LogoContainer>
        <TermsLinkContainer>
          <StyledNavLink to="/terms">
            <b>TERMS & CONDITIONS</b>
          </StyledNavLink>
        </TermsLinkContainer>
      </FooterStyle>
    </OuterContainer>
  )
}
export default Footer

const OuterContainer = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
}));

const SocialContainer = styled('div')(({ theme }) => ({
  gridArea: 'social',
  justifySelf: 'flex-start',
  [theme.breakpoints.down('sm')]: {
    justifySelf: 'center',
  },
}));

const LogoContainer = styled('div')(({ theme }) => ({
  gridArea: 'logo',
  justifySelf: 'flex-end',
  paddingTop: '0em',
  display: 'flex',
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    justifySelf: 'center',
    paddingTop: '2em',
  },
}));

const NavigationContainer = styled('div')(({ theme }) => ({
  gridArea: 'navigation_footer',
  justifySelf: 'flex-end',
  [theme.breakpoints.down('sm')]: {
    justifySelf: 'center',
  },
}));

const TermsLinkContainer = styled('div')(({ theme }) => ({
  gridArea: 'terms',
  justifySelf: 'flex-end',
  marginBottom: '2em',
  color: theme.palette.grey[800],
  [theme.breakpoints.down('sm')]: {
    justifySelf: 'center',
    marginTop: '2em',
  },
}));

const LetsTalkStyle = styled('p')(({ theme }) => ({
  gridArea: 'lets-talk',
  justifySelf: 'flex-start',
  fontStyle: 'normal',
  fontWeight: 500,
  fontSize: '28px',
  lineHeight: '42px',
  color: theme.palette.grey[800],
  [theme.breakpoints.down('sm')]: {
    justifySelf: 'center',
    paddingBottom: 0,
  },
  '& span': {
    color: theme.palette.grey[800],
  },
}));

const Items = ({ items, renderComponent, columns }) =>
  split(Object.keys(items), columns).map((col) => (
    <ItemsStyle>{col.map(renderComponent)}</ItemsStyle>
  ));

const ItemsStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: '3em',
  width: '100%',
}));

function split(array, cols) {
  if (cols === 1) return [array];
  var size = Math.ceil(array.length / cols);
  return [array.slice(0, size)].concat(split(array.slice(size), cols - 1));
}

const FooterStyle = styled(Container)(({ theme }) => ({
  padding: '3em 86px 0 86px',
  width: '100%',
  paddingBottom: '30px',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gridTemplateAreas: `
    "lets-talk logo"
    "social terms"
    "navigation_footer navigation_footer"
  `,
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gridTemplateAreas: `
      "logo"
      "navigation_footer"
      "lets-talk"
      "social"
      "terms"
    `,
    padding: 0,
    marginBottom: '2em',
    maxWidth: '414px',
  },
  fontStyle: 'normal',
  fontWeight: 400,
  fontSize: '18px',
  lineHeight: '23px',
  color: theme.palette.grey[800],
  '& a': {
    color: theme.palette.grey[800],
  },
}));

const StyledLink = styled(LinkStyle)(({ theme }) => ({
  transition: 'color 0.3s ease',
  '&:hover': {
    color: theme.palette.primary.main,
  },
}));

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  transition: 'color 0.3s ease',
  '&:hover': {
    color: theme.palette.primary.main,
  },
}));
