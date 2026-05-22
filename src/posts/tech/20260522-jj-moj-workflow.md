---
title: Jujutsu (JJ) w praktyce.
description: Mój codzienny workflow pracy z jj.
date: 2026-05-22
tags:
 - tech 
 - git
 - jj
---

Ostatnio pisałem o tym, dlaczego po roku przerwy wróciłem do Jujutsu (`jj`) i jak bardzo odmieniło to moje podejście do VCS - [link tutaj](/posts/tech/20260521-jj-czyli-git-na-sterydach). Dzisiaj obietnica dotrzymana – schodzimy poziom niżej, do czystej praktyki.

Pokażę Wam mój codzienny workflow na bazie konkretnego release brancha, przejdziemy przez klasyczny "happy path", a potem rzucimy wyzwanie dwóm realnym scenariuszom: nagłemu bugowi z QA oraz zaawansowanemu rozbijaniu metadanych Salesforce za pomocą `jj split`.

W każdym kroku pokażę Wam podejście bazujące na unikalnych identyfikatorach rewizji (`Change ID`) oraz wygodne metody alternatywne, np. operowanie bezpośrednio na zdalnych gałęziach z origin.

### Scenariusz 1: Klasyczny Happy Path

Wszystko zaczyna się od porannej kawy i tablicy w Jirze.

#### 1. Pobranie zmian i lokalizacja celu.

Najpierw muszę upewnić się, że mam najnowszy stan gałęzi release (nazwijmy ją `release/may26`).

```bash
jj git fetch
```

#### 2. Rozpoczęcie pracy (Nowa rewizja).

W `jj` nie tworzę lokalnej gałęzi. Po prostu otwieram nową, czystą przestrzeń roboczą nad gałęzią docelową. Mogę to zrobić na dwa sposoby:

- Podejście A (Przez ID rewizji): Szukam w `jj log` identyfikatora, który odpowiada gałęzi `release/may26` (np. `zvon`) i wpisuję:

```bash
jj new zvon
```

- Podejście B (Alternatywne – Bezpośrednio od origin): Nie muszę sprawdzać logu ani szukać ID. Mogę wskazać cel bezpośrednio po nazwie zdalnego bookmarka, co daje pewność, że bazuję na najświeższym stanie z serwera:

```bash
jj new release/may26@origin
```

#### 3. Kodowanie, opis i zakładka (`Bookmark`).

Robię swoje w edytorze. Kiedy kod działa, opisuję swoją rewizję i przypisuję do niej `bookmark ` (odpowiednik `git branch`), żeby system CI/CD i mój zespół widział moją pracę:

```bash
jj describe -m "feat: FT-100 Add delivery calculations"
jj bookmark create feature/ft-100
```

#### 4. Wypchnięcie do repozytorium.

```bash
jj git push --bookmark feature/ft-100
```

### Scenariusz 2: Nagły bug z QA (Zmiana kontekstu w locie)

Pracuję już nad kolejnym zadaniem (`FT-101`), mam rozgrzebany kod. Nagle QA zgłasza błąd w moim poprzednim zadaniu (`FT-100`). Trzeba to poprawić natychmiast. `jj ` automatycznie zapisał stan mojego `FT-101`, więc bez żadnego stashowania po prostu przełączam kontekst.

#### 1. Powrót do popsutego zadania.

- Podejście A (Przez ID rewizji): Odnajduję ID rewizji z `FT-100` (np. `mwqt`):

```bash
jj edit mwqt
```

- Podejście B (Alternatywne – Po nazwie bookmarka): Jeśli mam lokalnie przypisany bookmark do tego zadania, zamiast szukać losowych ciągów znaków w logu, po prostu wpisuję jego nazwę:

```bash
jj edit feature/ft-100
```
    
#### 2. Poprawka i aktualizacja.

Wprowadzam poprawkę w kodzie, a `jj` samoczynnie wtapia ją w wybraną rewizję. Wypycham zmiany:

```bash
jj git push --bookmark feature/ft-100
```

#### 3. Powrót do przerwanej pracy.

- Podejście A (Przez ID rewizji): Wracam do rozgrzebanego zadania `FT-101` (np. ID `pxrl`):

```bash
jj edit pxrl
```

- Podejście B (Alternatywne – Do głównego "wierzchołka"): Jeśli `FT-101` był moim ostatnim otwartym miejscem pracy przed poprawką, mogę użyć wbudowanego w `jj ` aliasu @, który zawsze oznacza aktualny working-copy commit. Aby wrócić na samą górę mojej rozgrzebanej pracy (zakładając, że `FT-101` stał się potomkiem po `rebase ` lub po prostu chcę skoczyć na jego `bookmark`):

```bash
jj edit feature/ft-101
```
    
### Scenariusz 3: Salesforce i magia jj split oraz jj squash

Teraz starcie z metadanymi Salesforce. Pracowałem nad nowym obiektem `Shipment__c` oraz uprawnieniami w profilach `Admin ` i `CustomerService`. Wszystko wylądowało w jednym commicie (ID: `xlst`). Wypchnąłem zmiany, ale walidacja CI/CD wyłożyła się na profilach.

Chcę wysłać sam działający obiekt `Shipment__c` do weryfikacji przez pipeline, a profile dopracować na boku.

#### Krok 1: Rozbicie zmian na osobne rewizje.

Uruchamiam interaktywne rozbijanie. Tutaj również zamiast identyfikatora `xlst ` mogę użyć nazwy aktywnego bookmarka:

```bash
jj split -r xlst
```
lub
```bash
jj split -r feature/shipment
```

W interfejsie TUI (np. `jjui`) zaznaczam pliki obiektu `Shipment__c`. Zatwierdzam.

Dla pierwszego commitu (obiekt) nadaję opis: `sf: deploy shipment object`.

Dla drugiego commitu (profile) nadaję opis: `sf: fix profiles for shipment`.

W efekcie mam teraz dwie rewizje ułożone jedna na drugiej: obiekt (`wzpt`), a nad nim profile (`qcrk`).

#### Krok 2: Natychmiastowa walidacja samego obiektu.

Muszę cofnąć mój bookmark `feature/shipment` o jeden krok w tył, do samego obiektu, i go wypchnąć:

```bash
jj bookmark move feature/shipment --to wzpt
jj git push --bookmark feature/shipment
```

(Alternatywnie, zamiast ID `wzpt`, w komendzie `move ` deweloperzy często używają składni relatywnej: 

```bash
jj bookmark move feature/shipment --to feature/shipment- 
```

> Ten mały minus na końcu oznacza "rodzica" (`parent`) danej rewizji.

#### Krok 3: Poprawa profili i połączenie zmian.

Gdy serwer mieli obiekt, ja pracuję nad profilami w rewizji `qcrk`. I tutaj pojawiają się dwa podejścia do sfinalizowania tematu:

- Podejście A (Zostawiamy dwa commity w historii): Kiedy skończę poprawiać profile, po prostu aktualizuję opis, przenoszę bookmark z powrotem na samą górę i robię push:

```bash
jj describe -m "sf: fix profiles for shipment - final"
jj bookmark move feature/shipment --to qcrk
jj git push --bookmark feature/shipment
```

- Podejście B (Alternatywne – Łączymy wszystko w jeden czysty `commit`): Jeśli reguły w zespole wymagają, aby całe zadanie zamknęło się w jednej idealnej rewizji w Git (tzw. `squash`), po naprawieniu profili mogę użyć komendy `jj ` squash. Wtapia ona bieżący commit w jego rodzica:

```bash
jj squash
```
    
`jj` automatycznie połączy pliki profilów z obiektem i poprosi o zredagowanie finalnego opisu. Nasz bookmark `feature/shipment` samoczynnie wskoczy na ten połączony commit, a ja muszę już tylko zrobić końcowy `jj git push`.

> ### Ważny detal: Dlaczego @origin, a nie origin/?
> Osoby przesiadające się z Gita mogą w tym momencie unieść brew, widząc zapis `release/may26@origin`. W Gicie przywykliśmy do tego, że nazwa zdalnego repozytorium (`remote`) stoi na samym początku: `origin/feature-branch`.
>
> `Jujutsu ` odwraca tę kolejność i robi to z bardzo konkretnego, logicznego powodu. W architekturze `jj ` najważniejszy jest `bookmark` jako obiekt abstrakcyjny, który może istnieć w wielu różnych miejscach jednocześnie. Zapis interpretujemy więc od szczegółu do ogółu:
>
> `[nazwa_bookmarka] @ [miejsce_gdzie_on_sie_znajduje]`
>
> Na przykład:
>
> `feature-100` – to Twoja lokalna wersja bookmarka.
>
> `feature-100@origin` – to stan tego samego bookmarka na serwerze zdalnym origin.
>
> Dzięki temu, jeśli pracujesz w zespole wieloosobowym lub z wieloma repozytoriami zdalnymi, składnia ta staje się niesamowicie przejrzysta. Widzisz czarno na białym, czy Twój lokalny wskaźnik i wskaźnik zdalny pokazują tę samą rewizję w grafie, bez sztucznego traktowania zdalnych gałęzi jako zupełnie osobnych referencji. To mała zmiana w notacji, która genialnie porządkuje myślenie o synchronizacji kodu.

### Podsumowanie
Jujutsu idealnie dopasowuje się do Twoich nawyków. Jeśli lubisz precyzję, operujesz na unikalnych, krótkich identyfikatorach rewizji w grafie. Jeśli wolisz płynność znaną z Gita, możesz sterować workflow za pomocą nazw bookmarków i odwołań bezpośrednio do origin.

Możliwość żonglowania podejściami, rozbijanie zmian za pomocą split i błyskawiczne naprawianie potoków CI/CD bez dotykania komendy stash sprawiają, że praca z wymagającymi metadanymi Salesforce wchodzi na zupełnie nowy poziom stabilności.
