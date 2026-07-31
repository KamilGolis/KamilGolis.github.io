---
title: Technologiczny czyściec.
description: Czy w 2026 roku praca bez gita jest git?
date: 2026-07-31
tags:
 - tech 
 - salesforce
---


# Przeżyłem wejście do projektu bez Gita. Opowieść z technicznego średniowiecza.

Wyobraź sobie, że żyjesz w roku 2026 (heh). Żyjesz w świecie, w którym sztuczna inteligencja pisze kod, pipelines CI/CD budują się w mgnieniu oka, a Prefix Caching i automatyczne testy pilnują, żeby nikt nie wysadził produkcji. Czujesz się bezpiecznie. Jesteś nowoczesnym programistą (kilka lat temu pewnie tzw. "Programistą 15k").

I wtedy przychodzi *ON*. Nowy projekt.

Wchodzisz na onboarding pełen nadziei, pytasz o repozytorium na GitHubie albo Bitbuckecie, a w odpowiedzi widzisz tylko ciszę na Slacku i delikatne zmieszanie.

– *„Git? A po co panu Git? My tu pracujemy na żywej tkance”*.

W tym momencie świat na chwilę zwalnia, a w tle zaczyna grać muzyka z horroru. Zastanawiasz się, czy może źle przeczytałeś, a może masz udar...

---

## Jeden sandbox, by wszystkimi rządzić.

Mój nowy stack techniczny? Salesforce. Pięknie, prawda? Szkoda tylko, że cała architektura projektu opiera się na jednym – **słownie: JEDNYM** – orgu deweloperskim.

Pracuję w zespole złożonym z chłopaków z Indii. Wszyscy oni piszeą kod bezpośrednio w **Developer Console**. Żadnych gałęzi, żadnych PR-ów, żadnego merge'owania. Po prostu czysta, nieposkromiona jazda bez trzymanki. Piszą klasę Apex, robią `Ctrl + S` i modlą się, żeby w tym samym ułamku sekundy kumpel z drugiego końca świata nie nadpisał ich 200 linijek kodu swoją wersją.

To nie jest programowanie. To jest **battle royale na żywym kodzie**. Kto pierwszy kliknie Save, ten wygrywa.

---

## Best practices? A komu to potrzebne?

Gdyby ktoś chciał stworzyć dekalog dobrych praktyk inżynierii oprogramowania, nasz projekt byłby doskonałym podręcznikiem, jak złamać wszystkie dziesięć punktów w pierwsze pięć minut pracy:

* **Code Review:** Oczywiście brak. Po co ktoś ma sprawdzać Twój kod, skoro użytkownicy na UAT zrobią to za darmo?
* **CI/CD:** Brak. Automatyzacja wdrażania polega na tym, że pamiętasz, co zmieniłeś i ręcznie klikasz odpowiednie przyciski.
* **Dokumentacja:** Mit (i nie chodzi o licencję MIT). Legendy mówią, że ktoś kiedyś stworzył plik w Wordzie w 2012 roku, ale nikt go nie widział. Procesy biznesowe? Rozkminiasz je sam na zasadzie archeologii kodu – czytasz chaotyczne `System.debug()`, próbując zgadnąć, co autor miał na myśli przed trzema laty.
* **QA / Testerzy:** Nie istnieją. Zespół QA to stan umysłu. Wrzucamy wszystko bezpośrednio na UAT i czekamy na krzyk klienta. Jeśli nie krzyczy, to znaczy, że działa (albo jeszcze nie kliknął).

---

## Potrzebni komandosi.

Kiedy opowiedziałem o tym znajomemu z branży, złapał się za głowę i podsumował to jednym trafnym zdaniem:

> *„Brak Gita, brak dokumentacji, praca w Dev Console na jednym orgu... Tu nie trzeba deweloperów. Tu potrzeba komandosów, którzy wiedzą co i jak robić, wchodzą, robią robotę i nie pytają o wsparcie powietrzne. Takie special ops tylko w świecie bitów i bajtów.”*

I coś w tym jest. Zamiast spokojnego pisania kodu mam codzienny survival. Zamiast *Git Blame* mam *Polska-Indie Roulette*. Każdą zmianę wprowadzam z precyzją sapera rozbrajającego ładunek w rękawicach kuchennych.

Jeśli więc kiedykolwiek uznacie, że Wasz pipeline CI/CD działa za wolno albo że ktoś czepia się szczegółów na Code Review – doceniajcie to. Bo gdzieś tam w sieci jest projekt, w którym jedynym systemem kontroli wersji jest... pamięć podręczna Twojego przeglądarkowego Developer Console i głęboka wiara w to, że nikt dzisiaj niczego nie zepsuje.

## No dobra, ale na poważnie...

Tak, to jest na poważnie.

Na szczęście nie jestem typem, który bezczynnie płacze nad wylanym mlekiem (i brakiem pipeline'ów). Skoro nie dostałem cywilizowanych narzędzi od projektu, postanowiłem stworzyć własną bazę w głębokim lesie. Wywalczyłem własne środowisko (sandboxa!) i zacząłem budować prywatną partyzantkę. Lokalnie postawiłem własne repozytorium oparte o **Jujutsu (JJ) i Gita**, a do tego powoli wdrażam autorskie, miniaturowe CI/CD na skryptach. Jak to działa? Magia i spryt: zanim w ogóle pomyślę o commicie, moje automatyczne skrypty pobierają najświeższe zmiany z UAT, nakładają na nie moje modyfikacje i podsuwają mi przejrzysty diff do review. Dopiero gdy sam klepnę własny kod, trafia on bezpiecznie do "mojej szuflady". Zespół myśli, że jestem jakimś czarnoksiężnikiem Apexu, a ja po prostu jako jedyny w tym uniwersum mam przycisk `undo`. *Wow, witamy w XXI wieku, chociaż tylko na moim dysku.*
