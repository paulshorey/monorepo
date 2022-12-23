import Head from 'next/head';
import Block from '@techytools/ui/components/Block';
import Code from '@techytools/ui/components/Code';
import styled from '@emotion/styled';
import cconsole from '@techytools/cc';

export default function Home() {
  const H1 = styled.h1`
    color: orange;
  `;
  cconsole.success('rendered Home component');
  return (
    <div>
      <Head>
        <title>Example app</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Block as="main" bgcolor="dark" textcolor="light">
        <H1>
          This is a very very simple Next.js website that includes only a couple
          of Harmony UI components.
        </H1>
        <Block as="p">
          The purpose for this is to (1) test that the library is working
          properly and is able to be imported into a NextJS project and (2) a
          bootstrap starter project that you can copy/paste to start your own
          app.
        </Block>
        <Code
          code={`test code block ad fad dasf afda fddfsfds dsf afds afd fds adfs afd fds`}
          language="markdown"
        />
      </Block>
    </div>
  );
}
