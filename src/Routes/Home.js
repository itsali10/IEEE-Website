import React from 'react'
import Hero from "../components/Hero/Hero";
import OurSponsors from "../components/OurSponsors/OurSponsors";
import SubHeader from "../components/SubHeader/SubHeader";
import GetInTouch from "../components/GetInTouch/GetInTouch";
import OurImpact from "../components/OurImpact/OurImpact";
import HomeTechnicalTeams from "../components/HomeTechnicalTeams/HomeTechnicalTeams";

const Home = () => {
  return (
    <>
      <Hero></Hero>
      <SubHeader></SubHeader>
      <OurImpact></OurImpact>
      <HomeTechnicalTeams />
      <OurSponsors></OurSponsors>
      <GetInTouch></GetInTouch>
    </>
  )
}

export default Home
