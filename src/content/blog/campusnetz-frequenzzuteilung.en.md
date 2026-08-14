---
title: "Your Own 5G Spectrum in Germany: How BNetzA Licensing Actually Works"
locale: "en"
description: "Application, cost, deadlines: what companies really need for a licensed campus network in the German 3.7 GHz band. With a worked cost example."
author: "SAJ Connect Team"
publishedAt: 2026-08-14
tags: ["private-5g", "bnetza", "campus-network"]
draft: true
---

When companies think about Private 5G, they think about radio planning, antennas and core networks. The actual foundation is far less glamorous: an administrative decision. Germany has reserved the 3.7–3.8 GHz band for local networks, and you apply for your allocation directly with the Federal Network Agency (Bundesnetzagentur, BNetzA). The good news up front: this is not an auction. It is an application. If your paperwork is in order, you get your spectrum.

## What you actually get

The allocation gives you the exclusive right to use up to 100 MHz in the 3.7–3.8 GHz band, limited to your premises and to a term of up to ten years (renewable). Within that area, nobody else transmits on your frequency. That is what separates a campus network from any Wi-Fi deployment: the radio environment is yours, by official decision.

For special cases with extreme capacity needs, local allocations at 26 GHz (mmWave) are also available. For most industrial applications, though, the 3.7 GHz band is the right place to start.

## Who can apply

Anyone who uses the site can apply: the property owner, or a tenant with the owner's consent. A company in a business park can apply just like a corporation for its own plant. A service provider can also file the application on your behalf and operate the network. The allocation stays tied to the area and its purpose.

## The process in five steps

1. **Define the area.** You specify your usage area as a polygon with coordinates. Important: the fee grows with the area. The polygon should cover your site, not the neighbourhood.
2. **Choose bandwidth and term.** 10 to 100 MHz, 1 to 10 years. If you are planning AGVs, cameras and dense sensing, 80 to 100 MHz is a sound choice. Pure IoT use cases often need less.
3. **Prove your right to use the site.** Informally as the owner, with the owner's consent as a tenant.
4. **File the application.** The BNetzA form asks for area, bandwidth, term and basic technical parameters. Complete applications are typically decided within a few weeks.
5. **Go live.** The spectrum must actually be used within one year of the allocation. Applying just to reserve it does not work.

## What it costs: the honest numbers

The one-off allocation fee follows a published formula: a base of 1,000 euros plus a component that grows with bandwidth, term and area. Two practical examples:

- **Full scale:** 100 MHz, ten years, 0.5 km² of plant area comes to roughly 16,000 euros.
- **Compact entry:** 50 MHz, five years, 0.2 km² comes to roughly 2,500 euros.

Small annual spectrum-use and EMC charges come on top. Compared with what hardware, integration and operations cost, the licence is almost always the smallest line item in the project. If a campus network gets rejected on cost grounds, it should not be because of the spectrum.

## The pitfalls we see in practice

**The polygon is too big.** If you generously draw half the district, you pay for area you will never cover. Radio planning first, polygon second.

**Your neighbour has a campus network too.** Adjacent allocations have to coexist. In practice that means synchronising TDD frames and staying within power limits at the property line. It is solvable, but it belongs before the application, not after.

**The one-year deadline slips.** Twelve months sounds like plenty. With hardware lead times, integration and acceptance testing in between, it is not. The application belongs inside the project plan, not at its very start or very end.

**The term does not match the depreciation.** A ten-year allocation against a five-year hardware lifecycle, or the reverse: both can be planned for, if you run the numbers beforehand.

## Bottom line

Spectrum licensing is the most overestimated fear and the most underestimated planning element of a campus network. The application itself is routine. What matters is that area, bandwidth and schedule match your radio plan before the form gets filled in.

That order of work is part of our project method. If you are planning a campus network in Germany and want the spectrum question settled: [let's talk about your project](/en/contact). After that, the allocation is the easy part.
