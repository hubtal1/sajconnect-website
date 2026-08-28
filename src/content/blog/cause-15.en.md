---
title: "Cause 15"
locale: "en"
description: "An operator refused to type-approve our client's device. The trace said the network was rejecting it. Both were right, and neither was the problem."
author: "SAJ Connect Team"
publishedAt: 2026-08-28
tags: ["news"]
draft: false
---

An operator refused to type-approve a client's device. Their position was that the device was misconfigured and would cause problems on their network, and by the time we heard about it the discussion had gone a few rounds without moving.

We were in the same city that week for a validation session, and the operator's lab happened to be there too, so we offered to come and have a look. Our own testing had never produced the behaviour they were describing, and that bothered us more than the delay did.

Next morning, trace tool on the air interface. Module powered up. Attach.

Reject. Cause 15, no suitable cells in tracking area.

Which was awkward, because it meant the operator was right. Something in the network was refusing the device. The question was what, and there was no obvious candidate. The module was standard. The configuration had been reviewed twice. The same hardware had attached to other networks all week.

So we asked whether the lab had any particular network configuration we should know about.

No, we were told. Standard setup.

We stood around for a while getting nowhere, and eventually one of us suggested taking the module out of the lab and trying it in a normal office in the same building. It was less an idea than something to do.

It attached on the first attempt. No errors, no delay.

The lab was running its own femtocell, connected to the live core, configured to accept only test devices. Somebody had built that years earlier and the configuration had an error in it, so every ordinary UE that walked in got rejected. Nobody had noticed, because in a lab full of test devices, nothing ordinary ever walked in. The device we had come to defend had been behaving correctly the entire time.

The whole thing took about forty minutes once we had a trace in front of us.

We think about that morning fairly often, mostly because of how it nearly went.

The device gets blamed by default. It is the newest thing in the chain and the only component nobody in the room built, so suspicion lands there first and stays longer than it should. Everyone involved would also prefer the fault to sit somewhere other than their own infrastructure, which is human and which quietly shapes how long people keep looking.

And the disagreement was never going to be settled by talking. Two parties across a table, both certain, both partly right. Another meeting would have produced another meeting. What ended it was a trace and a walk down the corridor.

The trace is the part that gets skipped. Plenty of teams doing device work have never had access to the air interface, because the tooling sits with a supplier and nobody thought to ask for it during the contract. Then a certification report comes back saying "fails attach procedure", which is a verdict and not evidence, and there is nothing to argue with.

If you are stuck in one of these, get a trace from the actual failure, and try the device somewhere else with as little as possible changed. When it works one room over, the conversation is finished. Also, treat the first answer about the test environment as a starting point. Labs collect configuration over years and the person answering usually inherited it.

That is most of what we do when a device and a network disagree. We turn up with a trace tool, we have no stake in whose fault it is, and we ask what is different about the room.

If you have a device that a network will not accept: let's talk about your project.
