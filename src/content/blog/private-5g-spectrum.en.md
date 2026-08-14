---
title: "Your Own 5G Spectrum in the US: How CBRS Actually Works"
locale: "en"
description: "No licence, no auction, no waiting: how enterprises get on air with CBRS, what a SAS does, and when a PAL is worth the money."
author: "SAJ Connect Team"
publishedAt: 2026-08-14
tags: ["private-5g", "cbrs", "campus-network"]
draft: true
---

In Germany, a company applies to the regulator and receives its own exclusive slice of spectrum. In the United States, the answer to the same question looks completely different: for most private networks there is no licence at all. The band is called CBRS, and understanding how it works is the first real planning decision of any US campus network.

## What CBRS is

CBRS (Citizens Broadband Radio Service) covers 150 MHz between 3.55 and 3.7 GHz, governed by FCC Part 96. The band is shared across three tiers. At the top sit incumbents, mainly naval radar and satellite ground stations. In the middle sit Priority Access Licenses (PALs), county-level licences auctioned in 2020. At the bottom sits General Authorized Access (GAA), and that is where most enterprise networks live.

## Getting on air with GAA

GAA is licensed by rule: no application to the FCC, no allocation decision, no waiting period. Instead, every base station (a CBSD in FCC language) registers with a Spectrum Access System, a cloud service run by certified administrators such as Google, Federated Wireless or Amdocs. The SAS assigns channels and power levels dynamically and keeps everyone clear of the tiers above.

In practice this means a US private network is regulatorily ready in days. The real lead time sits in hardware delivery and integration, not in paperwork. Two things are mandatory, though: the radios must be Part 96 certified, and outdoor or higher-power installations must be signed off by a Certified Professional Installer (CPI).

## What GAA does not give you

This is the part German readers should slow down for. GAA gives you spectrum access, not spectrum ownership. There is no exclusivity and no protection: the SAS can reassign your channels at any time, incumbents and PAL holders take precedence, and if another company next door deploys GAA as well, you share what is left. Near the coasts, radar activity can shift channels dynamically.

For an office, a warehouse or most factory floors, this works far better than it sounds — the band is wide and the SAS is good at its job. But it is a fundamentally different promise than a German allocation.

## When a PAL is worth it

If you need guaranteed spectrum — dense urban locations, mission-critical processes, no tolerance for channel moves — you can lease PAL spectrum from the companies that won it in 2020 (Verizon, Dish, Charter and various utilities among them). PALs run ten years, are renewable, and are tradable on the secondary market. Most enterprises never need one. The ones that do usually find out through a site survey, not a brochure.

## What it costs

There is no one-off spectrum fee. Instead you pay an ongoing SAS subscription per radio. Public list prices barely exist; as a planning figure, expect a per-access-point amount in the low hundreds of dollars per year, depending on provider and device category. As in Germany, spectrum is the smallest line in the project budget — hardware, integration and operations dominate.

## The pitfalls we see in practice

**Treating GAA like licensed spectrum.** If your business case assumes exclusivity, it assumes something CBRS does not sell. Design for coexistence, or price in a PAL lease.

**Skipping the spectrum survey.** In dense areas, GAA can be busy. An hour of measurement before the design phase beats a surprise after the rollout.

**Forgetting the CPI.** Outdoor and Category B installations need a Certified Professional Installer. That is a scheduling item, not a formality.

## Bottom line

The US model trades certainty for speed: you get on air in days, but you share the band. The German model trades speed for certainty: a formal application, then the spectrum is yours alone. Neither is better in the abstract — but your architecture, your redundancy planning and your business case need to know which world they live in.

We plan and operate private networks on both sides of the Atlantic. If you are weighing up a US deployment: [let's talk about your project](/en/contact).
