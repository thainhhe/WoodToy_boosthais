import Hero from "../components/Hero";
import Stories from "../components/Stories";
import Features from "../components/Features";
import Team from "../components/Team";
import Introduction from "../components/Introduction";
import FloatingSocial from "../components/FloatingSocial";
import Press from "../components/Press";

export default function Home() {
  // Component CTA cũ đã được tích hợp vào các section khác, nên không cần nữa.
  return (
    <main>
      <Hero />
      <Introduction />
      <Stories />
      <Features />
      <Team />
      <FloatingSocial />
      <Press />
    </main>
  );
}
