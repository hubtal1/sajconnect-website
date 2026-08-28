---
title: "Cause 15"
locale: "de"
description: "Ein Netzbetreiber verweigerte die Freigabe für das Gerät unseres Kunden. Der Trace zeigte, dass das Netz es tatsächlich ablehnte. Beide hatten recht, und keiner war das Problem."
author: "SAJ Connect Team"
publishedAt: 2026-08-28
tags: ["news"]
draft: false
---

Ein Netzbetreiber verweigerte die Type Approval für das Gerät eines Kunden. Seine Position: Das Gerät sei falsch konfiguriert und würde in seinem Netz Probleme machen. Als wir davon hörten, war die Diskussion schon ein paar Runden gelaufen, ohne dass sich etwas bewegte.

Wir waren in derselben Woche für eine Validierung in der Stadt, und das Labor des Betreibers lag zufällig auch dort. Also boten wir an, vorbeizukommen und uns das anzusehen. In unseren eigenen Tests war das beschriebene Verhalten nie aufgetreten, und das störte uns mehr als die Verzögerung.

Am nächsten Morgen: Trace-Tool an der Luftschnittstelle, Modul hochgefahren, Attach.

Reject. Cause 15, no suitable cells in tracking area.

Was insofern unangenehm war, als der Betreiber damit recht hatte. Irgendetwas im Netz wies das Gerät ab. Die Frage war, was, und es gab keinen naheliegenden Kandidaten. Das Modul war Standard. Die Konfiguration war zweimal geprüft worden. Dieselbe Hardware hatte die ganze Woche über in anderen Netzen problemlos attached.

Also fragten wir, ob es im Labor irgendeine besondere Netzkonfiguration gebe, von der wir wissen sollten.

Nein, hieß es. Standard-Setup.

Wir standen eine Weile herum und kamen nicht weiter, bis irgendwann jemand vorschlug, das Modul aus dem Labor zu nehmen und es in einem normalen Büro im selben Gebäude zu versuchen. Das war weniger eine Idee als etwas zu tun.

Es attachte im ersten Anlauf. Keine Fehler, keine Verzögerung.

Im Labor lief eine eigene Femtozelle, angebunden an den Live-Core, konfiguriert so, dass sie nur Testgeräte annimmt. Jemand hatte das Jahre zuvor aufgebaut, und in der Konfiguration steckte ein Fehler, sodass jedes gewöhnliche UE abgewiesen wurde. Aufgefallen war das nie, weil in einem Labor voller Testgeräte eben nie etwas Gewöhnliches vorbeikommt. Das Gerät, für das wir angereist waren, hatte sich die ganze Zeit korrekt verhalten.

Vom ersten Trace bis zur Auflösung vergingen etwa vierzig Minuten.

An diesen Vormittag denken wir öfter, vor allem daran, wie knapp es war.

Das Gerät steht standardmäßig unter Verdacht. Es ist das Neueste in der Kette und das einzige Teil, das niemand im Raum selbst gebaut hat. Der Verdacht landet dort zuerst und bleibt länger, als es die Faktenlage hergibt. Dazu kommt, dass allen Beteiligten der Fehler lieber woanders liegt als in der eigenen Infrastruktur. Das ist menschlich, und es beeinflusst still, wie lange jemand weitersucht.

Durch Reden wäre die Sache nie geklärt worden. Zwei Parteien am Tisch, beide sicher, beide teilweise im Recht. Ein weiteres Meeting hätte ein weiteres Meeting ergeben. Beendet hat es ein Trace und ein Gang über den Flur.

Genau der Trace ist der Teil, der übersprungen wird. Viele Teams, die an Geräten arbeiten, hatten nie Zugriff auf die Luftschnittstelle, weil das Werkzeug beim Lieferanten liegt und bei der Vertragsgestaltung niemand daran gedacht hat. Dann kommt ein Zertifizierungsbericht zurück, in dem "fails attach procedure" steht, und das ist ein Urteil, kein Beleg. Damit lässt sich nicht arbeiten.

Wer gerade in so einer Situation steckt: Besorgt euch einen Trace vom tatsächlichen Fehlerfall, und probiert das Gerät an einem anderen Ort, mit so wenig Änderungen wie möglich. Wenn es einen Raum weiter funktioniert, ist die Diskussion vorbei. Und behandelt die erste Auskunft über die Testumgebung als Ausgangspunkt. Labore sammeln über Jahre Konfiguration an, und wer dort Auskunft gibt, hat das meiste davon geerbt.

Das ist das meiste von dem, was wir tun, wenn Gerät und Netz sich uneinig sind. Wir kommen mit einem Trace-Tool, wir haben kein Interesse daran, wessen Fehler es ist, und wir fragen, was an diesem Raum anders ist.

Wenn ein Netz euer Gerät nicht annimmt: Sprechen wir über euer Projekt
