---
title: Xml2l - mój tool na problemy z profilami.
description: Pierwszy projekt napisany w GO.
date: 2026-06-21
tags:
 - tech 
 - go
 - salesforce
---

# Masz dość bałaganu w profilach Salesforce? 

Zarządzanie metadanymi w ekosystemie Salesforce to chleb powszedni każdego dewelopera i architekta. Kto jednak choć raz nie spędził długich godzin na walce z ogromnymi, niespójnymi plikami XML reprezentującymi profile, ten dobrze zna ból związany z wdrażaniem zmian (deploymentem) . Nadmiarowe tagi, zerwane referencje do usuniętych pól czy brakujące wartości potrafią skutecznie zablokować nawet najprostszy release.

Narzędzia, którymi dysponujemy w oficjalnym ekosystemie Salesforce (w tym SF CLI - oparte głównie na JavaScript/TypeScript), często opierają się na prostym operowaniu na ciągach znaków lub ciężkich skryptach, które potrafią drastycznie zwolnić przy plikach ważących po kilkadziesiąt megabajtów.

`xml2l` stworzyłem pierwotnie na własne potrzeby wynikające akurat z zadania jakie mi przypadło (dodanie prostego dostępu do pola na profilu). Ponieważ narzędzie realnie ułatwiło mi pracę, postanowiłem udostępnić kod źródłowy jako open-source . 

> Warto dodać, że dopiero uczę się języka Go, a ten projekt to mój pierwszy większy projekt publiczny w tym języku, więc tym bardziej zachęcam do konstruktywnego feedbacku!

## Jak to działa pod maską?

Zamiast traktować pliki `XML` jak zwykły tekst, `xml2l` podchodzi do tematu architektonicznie – buduje w pamięci skierowany graf acykliczny (DAG) . Dzięki temu program "rozumie" strukturę uprawnień i relacje między obiektami, a napisanie go w Go zapewnia świetną wydajność i natychmiastowe przetwarzanie nawet gigantycznych paczek metadanych (a to wszystko dzięki temu, że go tak świetnie radzi sobie z wielowątkowością).

Cały proces czyszczenia profili zamknąłem w kilku krokach :

- **Czyszczenie i parsowanie (Tag Stripping)**: Narzędzie pobiera surowy plik XML, odrzuca zbędny narzut i tokenizuje dane - pierwszy etap gdzie można wychwycić zduplikowane tagi.

- **Tworzenie grafu**: Tworzony jest wewnętrzny model relacji pomiędzy referencjami, prosty graf powiązań (node - edge - node).

- **Pełna normalizacja**: Profile są odtwarzane od zera. Wszystkie tagi zostają idealnie posortowane i poukładane według oficjalnych schematów (jak wiemy profile mają ustandaryzowany "schemat" więc jest to dosyć proste zadanie). Koniec z konfliktami w Git wywołanymi tym, że ktoś zapisał linie w losowej kolejności!

- **Automatyczna naprawa (Default Value Backfilling)**: Jeśli w pliku brakuje wymaganych tagów, silnik uzupełnia je bezpiecznymi wartościami domyślnymi. Jest to o tyle istotne, że docelowo pliki profilów powinny być niemal identyczne (z tą samą ilością tagów) a różnić się jedynie wartościami w tagach. Domyślne wartości w Salesforce to zazwyczaj `false` (dla większości tagów) oraz kilka unikatowych wariantów, jak na przykład taby, gdzie ustawiam wartość `Hidden`.

- **Usuwanie martwych referencji (Dead Reference Elimination)**: Przeszukując graf, `xml2l` identyfikuje i usuwa "wiszące wskaźniki" – np. uprawnienia do pól czy stron, które już dawno nie istnieją w repozytorium.

## Jak użyć tego narzędzia?

Narzędzie można bardzo łatwo wpiąć w lokalny workflow lub pipeline `CI/CD`.

### Instalacja i budowanie projektu.

Aby sklonować repozytorium i zbudować plik wykonywalny, wystarczy wykonać poniższe komendy w terminalu:

```bash
git clone https://github.com/KamilGolis/xml2l.git 
cd xml2l 
go build -o xml2l ./cmd/engine 
```

#### Przykładowe uruchomienie.

Uruchomienie silnika na katalogu z profilami:

```bash
./xml2l profile save --path ~/some-project/force-app/main/default/
```
> Obecnie aplikacja potrzebuje ścieżki do katalogu projektu, w przyszłości zamierzam używać parsowania pliku `sfdx-project.json` w celu znalezienia "punktu startowego".

#### Dostępne flagi.

`--path` lub `-p` – Ścieżka do katalogu projektu.

> W pliku `Readme` w repozytorium dostępne są jeszcze inne flagi oraz komendy, ale nie są one jeszcze w pełni gotowe.

## Co dalej? Plany na rozwój.

Kod jest jeszcze na wczesnym etapie, ale mam już sprecyzowane plany na usprawnienia. W kolejnych wersjach planuję dodać:

- Rozbudowany eksport grafów: Możliwość jeszcze łatwiejszego wyciągania zbudowanych struktur do zewnętrznych formatów (jak `JSON` czy `DOT/Graphviz`) w celu głębszej analizy zależności.

- Weryfikację krzyżową (Cross-check z orgiem): Funkcję, która pobierze aktualny `org schema` bezpośrednio z Twojego orga Salesforce i zwaliduje profil pod kątem faktycznie istniejących tam obiektów i pól i innych metadanych.

Zachęcam do przetestowania projektu, zgłaszania błędów (Issues) lub podsyłania własnych poprawek w Pull Requestach!

> Kod źródłowy znajdziesz [w moim repozytorium](https://github.com/KamilGolis/xml2l).