// import BubbleComments from "../components/BubbleComments";
import CitySearch from "../components/CitySearch";

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <h1 className="hero-title"> The Best Scooters Tour!.</h1>
        <h2 className="hero-subtitle">
        Pick your Scooter and we'll show the way!
        </h2>
        {/* <BubbleComments
          comments={[
            { text: "Vespa tour in Rome?" },
            { text: "Colosseum by Vespa?" },
            { text: "Trastevere by scooter!" },
            { text: "Don't miss Scooters Tour!" }
          ]}
        /> */}
        <div className="city-search-container">
          <CitySearch />
        </div>
        <div className="cancellation-text">
          Flexible Booking and Free Cancellation
        </div>
      </div>
    </section>
  );
}
