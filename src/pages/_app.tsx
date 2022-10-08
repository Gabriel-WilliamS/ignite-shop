import { AppProps } from "next/app";
import { globalStyles } from "../styles/global";
globalStyles();

import logoImg from "../assets/logo.svg";
import Image from "next/image";
import { Container, Header } from "../styles/pages/app";
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Container>
      <Header>
        <Image src={logoImg} width="400px" alt="" />
      </Header>

      <Component {...pageProps} />
    </Container>
  );
}
