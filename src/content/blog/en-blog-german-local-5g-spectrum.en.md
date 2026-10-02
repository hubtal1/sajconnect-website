---
title: "Your Own 5G Spectrum in Germany: What the Application Involves"
locale: "en"
description: "Local 5G licences in the 3.7–3.8 GHz band are assigned on application, with no auction. What you can apply for, how the fee is calculated, and what the licence does not solve."
author: "SAJ Connect Team"
publishedAt: 2026-11-05
tags: ["private-5g", "spectrum", "campus-network", "germany"]
draft: true
---

Germany assigns part of the 3.7 GHz band to companies on application. There is no auction, and a company with a site of its own can hold a licence for a network on that site. Our article on CBRS in the US describes a model where you can get on air without applying for anything. This article covers the German one.

The framework opened in late 2019. In the Bundesnetzagentur's list from November 2025, there are 484 applications and 484 assignments.

What you can apply for

The band runs from 3,700 to 3,800 MHz. You can apply for 10 to 100 MHz of it, in steps of 10 MHz, for a defined area and for a period you choose, and the amount you ask for should match what the network needs.

The licence covers a network for your own use. You cannot run a public network on it or sell connectivity to third parties. Industrial parks, exhibition grounds and agricultural and forestry land are all covered. The spectrum is assigned technology-neutral, and on your own site you are free in how you plan the network.

Who can apply

You need a right to the site. That can be ownership, another right of use such as a lease or rental agreement, or a commission from someone who holds one of those rights. Several owners in one industrial park can also apply together for the whole area. Check that your right lasts as long as the licence you ask for, since a ten-year licence on a site you have leased for five years is a problem to solve before you submit.

What it costs

The fee follows a published formula. Bandwidth, duration and area all count, and built-up land costs six times as much per square kilometre as other land, because it needs more coordination with neighbouring users.

Fee in EUR = 1,000 + B × t × 5 × (6 × a1 + a2)

B is the bandwidth in MHz, t the duration in years, a1 the area of settlement and transport land in square kilometres, and a2 all other area.

Take 100 MHz for ten years on a site with 0.5 km² of built-up area. That comes to 16,000 euro. A smaller case, 50 MHz for five years on 0.2 km², comes to 2,500 euro.

These are the licence fees only. Radio planning, the core network, devices and operations are paid for separately.

How to apply

Applications go to the Bundesnetzagentur electronically, using its application forms. Most of the effort sits in defining your area. You are responsible for the coordinates of the area and of the planned base stations, and they decide both the fee and who your neighbours are.

The Bundesnetzagentur publishes a list of assignment holders, so that applicants can find adjacent users early and agree on interference-free operation with them. Read it before you apply. The band also sits directly above the national operators' spectrum, and any guard band towards that adjacent use has to come from the local licence holder. Treat coordination with neighbours as part of the project and not as a formality at the end.

Conditions people overlook

A licence can be revoked if you have not started using the spectrum within a year of the assignment, or if it then goes unused for longer than a year. The framework expects the network to be built, and spectrum held in reserve for later is a bad fit for it.

Close to the border, the Bundesnetzagentur has to coordinate with the neighbouring countries, and the result can limit what is possible at your site. If your site is anywhere near the Czech or Austrian border, ask early. Existing satellite earth station receivers in the band are protected, and so are some of the Bundesnetzagentur's own monitoring stations, so a few locations come with extra conditions.

What the licence does not solve

The licence gives you spectrum. It does not give you a working network.

Coverage has to be designed for the site as it is, with its steel racking and moving machinery, and a simulation of the empty building will not match it. A coverage plan drawn for an empty yard looked nothing like the same yard at shift change, when trucks and containers filled every gap.

The core decides how the network connects to your IT, who can reach it, and how it can be segmented. That is expensive to change once the network runs.

Devices have to support the band, which here means n78. Not every industrial device does, and getting a device certified for a particular network is a small project of its own.

SIM management needs an owner for a network that will live for eight to ten years. And someone has to operate the network once the project team has moved on.

The 26 GHz band

Germany also assigns local spectrum in the 26 GHz band, from 24.25 to 27.5 GHz. The procedure opened on 1 January 2021, and the Bundesnetzagentur still offers the application documents. It has its own administrative rule and its own fee formula, which makes it a separate application, and anyone can apply.

The blocks are much wider. The fee formula starts at 50 MHz, and blocks of up to 800 MHz are expected in practice. The fee factor is lower as well: 800 MHz for ten years on 0.5 km² of built-up area comes to about 16,100 euro, roughly what 100 MHz costs at 3.7 GHz under the same conditions.

Millimetre waves do not travel far, so this band suits short-range, high-capacity uses on compact sites. If your use case needs capacity more than coverage, it is worth a look.

Where to start

Start with what the network has to do: which processes depend on it, what latency they need, how many devices it will carry, how the site will look in three years, and who will operate it. The spectrum application follows from those answers and takes an afternoon once you have them.

We plan and operate private networks in Germany and the US. If you are considering your own, talk to us about your project.
