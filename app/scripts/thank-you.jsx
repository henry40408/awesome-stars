import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

import { version } from '../../package.json';

import { Footer, Header, Link } from './components/common';
import { Colors } from './services/colors';
import { BASE, rem } from './services/scale';

const Body = styled.div`
  margin: 0 auto;
  width: ${rem(960)};
`;

const Code = styled.code`
  color: ${Colors.BLUE};
`;

const HowToUse = styled.ol`
  padding: 0 ${rem(16)};
`;

HowToUse.Item = styled.li`
  line-height: ${32 / BASE};
`;

const Image = styled.img`
  margin: ${rem(16)} 0;
`;

Image.Wrapper = styled.div`
  text-align: center;
`;

const PageTitle = styled.h1`
  font-weight: 300;
`;

const Title = styled.h2`
  font-weight: 300;
`;

const UsefulLinks = HowToUse.withComponent('ul');

const UsefulLink = HowToUse.Item;

const Version = styled.span`
  font-size: ${rem(24)};
  font-weight: 700;
  color: ${Colors.YELLOW};
`;

const ThankYou = () => (
  <div>
    <Header />
    <Body>
      <PageTitle>{'Thank You for Using Awesome Stars!'}</PageTitle>
      <div>
        {'Awesome Stars has been successfully install or upgrade to '}
        <Version>{version}</Version>
        {' !'}
      </div>
      <Title>{'Useful Links'}</Title>
      <UsefulLinks>
        <UsefulLink>
          {'For more information, please checkout '}
          <Link href="https://github.com/henry40408/awesome-stars/blob/develop/README.md">{'README'}</Link>
          {'.'}
        </UsefulLink>
        <UsefulLink>
          {'To contribute to this project, please checkout '}
          <Link href="https://github.com/henry40408/awesome-stars/blob/develop/CONTRIBUTE.md">{'CONTRIBUTE'}</Link>
          {'.'}
        </UsefulLink>
        <UsefulLink>
          {'For more information about this version, please checkout '}
          <Link href="https://github.com/henry40408/awesome-stars/blob/develop/CHANGELOG.md">{'CHANGELOG'}</Link>
          {'.'}
        </UsefulLink>
      </UsefulLinks>
      <Title>{'How to Use?'}</Title>
      <HowToUse>
        <HowToUse.Item>
          <Link href="https://github.com/settings/tokens/new?description=Awesome%20Stars">{'Create a access token'}</Link>
          {' at GitHub settings. '}
          <strong>{'DO NOT select any scopes'}</strong>
          {'! For more information, checkout '}
          <Link href="https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/#creating-a-token">{'GitHub documentation'}</Link>
          {'.'}
        </HowToUse.Item>
        <HowToUse.Item>{'Click Awesome Stars icon to open Options page. It locates near the icon to open Chrome menu.'}</HowToUse.Item>
        <Image.Wrapper>
          <Image src="../images/awesome-stars-icon.png" alt="Awesome Stars Icon" />
        </Image.Wrapper>
        <HowToUse.Item>
          {'Paste access token into the field, which has placeholder '}
          <Code>{'Paste access token here'}</Code>
          {'.'}
        </HowToUse.Item>
        <Image.Wrapper>
          <Image src="../images/field-and-progress-bar.png" alt="Awesome Options Page" />
        </Image.Wrapper>
        <HowToUse.Item>{'Click '}<Code>{'Save'}</Code>{'.'}</HowToUse.Item>
        <HowToUse.Item>{'That\'s it!'}</HowToUse.Item>
      </HowToUse>
    </Body>
    <Footer />
  </div>
);

ReactDOM.render(<ThankYou />, document.getElementById('container'));
