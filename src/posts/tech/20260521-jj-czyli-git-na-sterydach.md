---
title: Jujutsu (JJ) czyli GIT na sterydach.
description: Czy można na nowo odkryć system kontroli wersji? Otóż można!
date: 2026-05-21
tags:
 - tech 
 - git
 - jj
---

## Jak Jujutsu (`jj`) sprawił, że na nowo polubiłem systemy kontroli wersji (i dlaczego działa to w Salesforce)

Czy zdarzyło Wam się kiedyś utknąć w pętli ``git stash``, `git checkout`, zastanawiając się, dlaczego prosta zmiana kontekstu wymaga tylu operacji deweloperskich? Ja przez ostatnie lata przywykłem do gita jako zła koniecznego. Jednak niedawno, po blisko rocznej przerwie, postanowiłem wrócić do **Jujutsu (`jj`)** – nowoczesnego systemu kontroli wersji od Google.

Efekt? Odkryłem VCS na nowo. Pracuje mi się niesamowicie przyjemnie, wypracowałem swój własny, płynny workflow i dzisiaj chcę Wam opowiedzieć, dlaczego warto dać mu szansę – nawet jeśli całe Wasze otoczenie stoi na gicie.

### O co właściwie chodzi? Filozofia i architektura Jujutsu

Jujutsu nie jest tylko kolejną nakładką na gita. To zupełnie nowy system kontroli wersji, który został zaprojektowany z myślą o eliminacji największych bolączek swojego starszego brata.

1. Bezpieczeństwo i brak `"stasha"`
W `jj` każda zmiana w katalogu roboczym jest automatycznie i natychmiastowo zapisywana jako commit (tzw. working-copy commit). Zapomnijcie o `git add` czy `git stash`. Chcecie zmienić gałąź? Po prostu to robicie, a niedokończona praca bezpiecznie czeka na Waszym poprzednim commicie. Co więcej, `jj` posiada pełną operację Undo – jeśli zepsujecie rebase albo usuniecie coś przez przypadek, jedno polecenie cofa czas.

2. Architektura zorientowana na rewizje (`Revision-oriented`)
W przeciwieństwie do gita, gdzie kluczowe są referencje i gałęzie (branches), Jujutsu skupia się na samych rewizjach i grafie zmian. Gałęzie w `jj` są opcjonalne i służą głównie do komunikacji ze światem zewnętrznym. Każda rewizja ma swój unikalny, krótki identyfikator (np. `kzmwtzno`), który nie zmienia się, dopóki nie skończycie nad nią pracować.

3. Konflikty jako stan pierwszoklasowy
To chyba największa rewolucja architektoniczna. W gicie konflikt blokuje Waszą pracę – musicie go rozwiązać tu i teraz, żeby pójść dalej. W `jj` konflikt jest po prostu częścią commitu. Możecie go odłożyć na później, zrobić rebase innych zmian, a sam konflikt rozwiązać wtedy, kiedy będziecie na to gotowi.

### Zmiana mentalności: Przełączamy myślenie na tryb `jj`

Trzeba to uczciwie przyznać: wejście w świat Jujutsu wymaga przestawienia zwrotnicy w głowie. Nasze nawyki z gita, budowane latami, tutaj mogą na początku lekko przeszkadzać.

W `jj` zupełnie inaczej podchodzi się do pojęcia zmian, commitów i pushowania:

- Commit dzieje się cały czas: Nie ma tu momentu "zamknięcia" paczki i nazwania jej. Pracujesz w otwartym commicie, a kiedy jesteś gotowy, po prostu opisujesz go za pomocą `jj describe`.
- Push bez tradycyjnych gałęzi: Zamiast myśleć kategoriami "wypycham moją lokalną gałąź na origin", w `jj` zarządzasz widocznością i statusem rewizji w globalnym grafie.

#### Fenomenalne operacje na grafie

Gdy już jednak przestawicie myślenie, `jj` odpłaci się funkcjami, które w czystym gicie wywołują gęsią skórkę. Operacje na historii są tu wręcz organiczne:

- `jj split`: Pozwala w bajecznie prosty, interaktywny sposób rozbić jeden wielki, roboczy commit na mniejsze, logiczne części.
- Intuicyjny `rebase`: Przenoszenie całych drzew zmian lub pojedynczych rewizji nad inny punkt w historii dzieje się natychmiastowo, bez strachu, że coś zgubimy.
- Zmiana kolejności commitów: Chcecie zamienić miejscami dwa commity wstecz? W `jj` to kwestia jednej komendy. System sam przeliczy zmiany, a jeśli pojawi się konflikt – jak wspomniałem wyżej – pozwoli Wam go rozwiązać bez przerywania pracy.

### Tajna broń: Pełna kompatybilność z Git

Brzmi świetnie, ale co z resztą zespołu? Tutaj dochodzimy do genialnego aspektu projektowego: `jj` może używać gita jako swojego backendu.

W praktyce oznacza to, że inicjalizujecie repozytorium jako kolaborację z gitem (`jj git init --colocated`). Cały Wasz zespół, potoki CI/CD oraz GitHub/GitLab widzą standardowe gałęzie gita. Wy natomiast pod maską używacie komend `jj`. `jj` automatycznie mapuje Wasz graf na gitowe commity i gałęzie przy każdym `jj git push` i `jj git fetch`. Pracujecie w nowoczesnym systemie, nie psując niczego swoim kolegom z zespołu.

### A jak to wygląda w świecie Salesforce?

Jako deweloper Salesforce, początkowo miałem pewne obawy. Nasz ekosystem bywa specyficzny – operujemy na setkach plików `XML`, rozbudowanych metadanych, a praca z Salesforce CLI (`sf`) potrafi generować spore drzewa zmian.

Po powrocie do `jj` z radością stwierdzam, że na ten moment nie zauważyłem absolutnie żadnych problemów przy pracy z Salesforce. Automatyczne commitowanie katalogu roboczego świetnie współgra z komendami typu `sf project retrieve` start czy `sf project deploy start`. Śledzenie zmian w metadanych stało się o wiele bardziej przejrzyste, a elastyczność w żonglowaniu commitami i ich rozbijaniu pozwala łatwo selekcjonować to, co naprawdę chcemy wdrożyć.

### Ekosystem: Narzędzia do terminala i VS Code

Mimo że `Jujutsu` jest stosunkowo młodym projektem, jego ekosystem rozwija się błyskawicznie i bez problemu można go wpiąć w swoje codzienne środowisko pracy.

#### Terminal – tam dzieje się magia

Domyślny CLI `Jujutsu` jest niezwykle czytelny, ale jeśli lubicie interaktywne narzędzia, terminal oferuje prawdziwe perełki:

- `jjui`: Absolutnie fantastyczne narzędzie! W bardzo wygodny i przemyślany sposób opakowuje wszystkie komendy `jj` w graficzny interfejs terminalowy. Sprawia, że zarządzanie grafem rewizji, podgląd zmian i nawigacja po historii stają się czystą przyjemnością, drastycznie obniżając próg wejścia w nowy workflow.
- `lazyjj`: Kolejna świetna opcja TUI, inspirowana popularnym lazygit, idealna do szybkiego przeglądania statusu pracy.

#### Integracja z VS Code
Dla osób spędzających czas w `VS Code` (co w Salesforce jest standardem) integracja jest zaskakująco bogata:

- W marketplace znajdziecie dedykowane rozszerzenia (np. Jujutsu czy `jj`-vscode), które zapewniają podświetlanie składni dla plików konfiguracyjnych i podstawowe wsparcie.
- Ponieważ `jj` działa w trybie współdzielonym z gitem (`--colocated`), wbudowany w VS Code panel Source Control nadal poprawnie widzi zmiany jako zmiany gitowe. Dostajecie więc to, co najlepsze z obu światów – potężny workflow w terminalu i znajomy podgląd "diffów" w edytorze.

### Słowo na koniec: Odkryj Git na nowo

Jeżeli czujecie rutynę, a codzienna walka z gitowym podejściem do gałęzi zaczyna Was męczyć, potraktujcie Jujutsu jako genialną ciekawostkę technologiczną, która może zmienić Wasz codzienny komfort pracy.

Dla mnie powrót do `jj` był jak powiew świeżego powietrza. Wymagał chwili na naukę nowego sposobu myślenia, ale komfort, jaki daje przy operacjach na historii, jest tego w stu procentach wart. Dajcie mu szansę na jednym mniejszym projekcie – ostrzegam tylko, że powrót do czystego gita bywa potem bolesny!
