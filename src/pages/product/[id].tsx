import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import { stripe } from "../../lib/stripe";
import Stripe from "stripe";
import {
  ImageContainer,
  ProductContainer,
  ProductDetails
} from "../../styles/pages/product";
import axios from "axios";
import { useState } from "react";
import Head from "next/head";

interface ProductProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
    description: string;
    defaultPriceId: string;
  };
}

export default function Product({ product }: ProductProps) {
  // Para fazer uma tela de loading
  // const { isFallback } = useRouter();

  // if (isFallback) {
  //   return <p>Loading...</p>;
  // }

  // Para enviar o usuario para uma rota
  // const router = useRouter();
  const [isCreationCheckoutSession, setIsCreationCheckoutSession] = useState(false);

  async function handleBuyProduct() {
    try {
      setIsCreationCheckoutSession(true);
      const response = await axios.post("/api/checkout", {
        priceId: product.defaultPriceId
      });

      const { checkoutUrl } = response.data;

      window.location.href = checkoutUrl;

      // Caso queira redirecionar o usuário para uma página interna
      // router.push("/checkout")
    } catch (error) {
      // conectar com uma ferramenta de observabilidade (Datadog/ Sentry)
      setIsCreationCheckoutSession(false);
      alert("Falha ao redirecionar ao checkout!");
    }
  }
  return (
    <>
      <Head>
        <title>{product.name} | Ignite shop</title>
      </Head>

      <ProductContainer>
        <ImageContainer>
          <Image src={product.imageUrl} alt="" width={520} height={480} />
        </ImageContainer>

        <ProductDetails>
          <h1>{product.name}</h1>
          <span>{product.price}</span>

          <p>{product.description}</p>

          <button disabled={isCreationCheckoutSession} onClick={handleBuyProduct}>
            Comprar agora
          </button>
        </ProductDetails>
      </ProductContainer>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{ params: { id: "prod_MZXGi9gms0TjsM" } }],
    fallback: "blocking"
  };
};

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({ params }) => {
  const productId = params.id;

  const product = await stripe.products.retrieve(productId, {
    expand: ["default_price"]
  });

  const price = product.default_price as Stripe.Price;

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL"
        }).format(price.unit_amount / 100),
        description: product.description,
        defaultPriceId: price.id
      }
    },
    revalidate: 60 * 60 * 1 // 1 hora
  };
};
