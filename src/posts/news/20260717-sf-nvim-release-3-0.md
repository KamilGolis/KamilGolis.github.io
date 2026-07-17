---
title: SF.NVIM - Release Notes.
description: Release 0.3.
date: 2026-07-17
tags:
 - tech 
 - lua
 - salesforce
---

# sf.nvim: Najważniejsze zmiany.

**Trzy releasy, masa linii kodu `Lua` i jedno bardzo konkretne marzenie: codzienna praca w Salesforce z poziomu Neovima.**

Jeśli jesteś deweloperem Salesforce i jednocześnie uwielbiasz Neovima, to doskonale znasz ten ból. VS Code ma wsparcie dla Salesforce'a dzięki oficjalnemu pakietowi rozszerzeń. Neovim z kolei ma świetną infrastrukturę pod `LSP` i `DAP`, ale przez długi czas nikomu nie chciało się stworzyć brakującego ogniwa, które by to wszystko spięło.

## Problem.

Salesforce CLI (`sf`) to taki szwajcarski scyzoryk w terminalu: potrafi wdrożyć metadane, odpalić testy, pobrać `org schema`, wykonać anonimowy kod Apex czy zarządzać logami debugowania. Sęk w tym, że każde jego wywołanie zmusza Cię do porzucenia edytora, wklepania komendy, czekania na odpowiedź i ręcznego parsowania wielkich plików JSON w poszukiwaniu błędów (aczkolwiek trzeba przyznać uczciwie, że domyślne odpowiedzi `sf cli` są przedstawiane w czytelny sposób).

Istniały już wtyczki do Salesforce pod Neovima, ale żadna z nich mi nie leżała. Chciałem czegoś, co będzie działać natywnie: asynchronicznych operacji z paskiem postępu, diagnostyki błędów z deploymentu bezpośrednio w kodzie (inline) i interaktywnych menu do wyboru akcji wszelakich – a wszystko to bez zamrażania UI edytora.

## v0.1: Fundamenty — Async callbacks, `diagnostics` i `Plenary.nvim`.

Pierwszy release miał po prostu posiadać podstawowe możliwości: deploy, unit testy, logi i ustawienie orga. Wszystko asynchronicznie i z czytelnym wskaźnikiem postępu.

### Decyzja architektoniczna: vim.system zamiast `Plenary.job`.

Pierwszy prototyp opierał się na `plenary.job` – popularnym w ekosystemie Neovima runnerze zadań w `Lua`. Jednak `Plenary` ma być (o ile już nie jest) zarchiwizowany ze względu na natywne nowe funkcje Neovima. Przejście na `vim.system` (natywny asynchroniczny launcher procesów wprowadzony w Neovimie od wersji 0.10) pozwoliło mi pozbyć się tej zależności i sprawiło, że plugin stał się w pełni samowystarczalny (no może poza zależnoścą do plugina `sgd` ale o tym później).

```
-- plenary.job
local job = require("plenary.job"):new({
  command = "sf",
  args = { "project", "deploy", "start", "--json" },
  on_exit = vim.schedule_wrap(function(j, code)
    -- callback hell begins
  end),
})
job:start()

-- vim.system
local handle = vim.system({
  "sf", "project", "deploy", "start", "--json",
}, nil, vim.schedule_wrap(function(result)
  -- still callback-based, but no extra dependency
end))
```

### Framework testowy: Dlaczego akurat mini.test?

Na samym początku rozważałem środowisko testowe na bazie `plenary.nvim` lub `mini.test` (no dobra, na początku miał być kombajn z użyciem `luarocks`). Wybór padł na to drugie z trzech powodów: 
- zero zewnętrznych zależności (jest częścią `echasnovski/mini.nvim`), 
- definiecie testów pisane w czystej `Lua`,
- banalnie proste asercje. 

Cała baza testów korzysta z przejrzystego wzorca `it()`, `expect.match`:

```
it("detects conflict error from deploy result", function()
  local result = vim.json.decode(fixtures.deploy_conflict)
  local is_conflict, msg = DeployResult.detect_source_conflict(result)
  expect(is_conflict).to_be(true)
  expect(msg):match("SourceConflictError")
end)
```

### Deployment errors (Diagnostics Pipeline).

Błędy deploymentów to chleb powszedni w pracy z Salesforce. Zamiast zmuszać dewelopera do czytania ściany tekstu w terminalu, `sf.nvim` parsuje zwracanego przez CLI JSON-a, wyciąga błędy konkretnych komponentów i przekazuje je bezpośrednio do silnika `diagnostics` Neovima. Każdy błąd jest mapowany na konkretny plik oraz linijkę i wyświetla się jako podświetlenie w edytorze (widoczne m.in. przez `vim.diag`).

Całość działa w czterech krokach: 
- parsowanie JSON-a
- wykrywanie konfliktów
- wyciąganie błędów komponentów 
- ustawienie diagnostyki. 

Krok drugi (`detect_source_conflict`) odpala się bardzo wcześnie, żeby szybko wyłapać `SourceConflictError`.

### Server Diff: URI `sf://` i synchronizacja diffów.

Funkcja porównywania kodu z serwerem z kodem lokalnym (`:Sf retrieve diff`) była najbardziej skomplikowanym elementem wersji `v0.1`. Pobiera ona metadane w formacie Salesforce `Metadata API` (tak na prawdę korzysta z flagi `--unzip` aby pobrać metadane do tymczasowego katalogu i tam je rozpakować; `sf cli` nie współpracuje dorze z ignorowanymi katalogami jak ustawiony domyślny dla wtyczki `.sf/`), a następnie konwertuje je do `source format`  za pomocą `sf project convert mdapi`. Wersja z serwera ląduje w katalogu tymczasowym i jest wczytywana do bufora w pamięci RAM, a sam folder tymczasowy jest nastęþnie usuwany.

Bufor w pamięci korzysta z własnego schematu `URI` `sf://`, dzięki czemu wbudowane `LSP` go ignoruje (`LSP` nie podpina się pod nieznane protokoły). Widok porównania otwiera się w nowym tabie z dwoma pionowymi oknami, których przewijanie jest zsynchronizowane za pomocą zdarzenia przewijania kursora połączonego z `nvim_win_call` + `win_execute`.

## v0.2: Warstwa interakcji — `Trace Flags`, `Debug Levels` i `Anonymous Apex`.

O ile w wersji `v0.1` skupiałem się na tym aby plugin umiał czytać stan z Salesforce, o tyle `v0.2` pozwala już na jego modyfikację. Pojawiły się trzy duże nowości, z których każda wymagała interaktywnych edytorów buforów, pickerów i wielokrokowych procesów.

### Interaktywny wzorzec bufora.

`Debug Levels` oraz `Trace Flags` posiadają w pełni ustrukturyzowane pola (jak kategorie, poziomy, znaczniki czasu etc.). Zamiast zmuszać użytkownika do ręcznej edycji plików JSON, stworzyłem interaktywne bufory Neovima, które oferują:

- **Kolorowanie składni** przez `ftplugin/sfdebuglevel.lua` i `ftplugin/sftraceflag.lua`
- **Walidację przy zapisie** — automatyczne zdarzenia `BufWriteCmd` parsują bufor i tworzą/aktualizują metadane przez Salesforce CLI

W przypadku `Debug Levels`, bufor wyświetla wszystkie kategorie (`Apex Code, Apex Profiling, Callout, Database, System itd.`) z możliwością konfiguracji ich poziomów. Przy zapisie plugin generuje odpowiedni plik JSON i uruchamia `sf data create record` lub `sf data update record`.

Z kolei przy `Trace Flags` najtrudniejszym zadaniem było **rozwiązywanie konfliktów nakładania się czasu**. Salesforce nie pozwoli na stworzenie dwóch nakładających się czasowo flag dla tego samego użytkownika. Przed utworzeniem nowej flagi, plugin odpytuje system o istniejące rekordy, wykrywa potencjalne konflikty czasowe i oferuje ich usunięcie bądź skrócenie. Wszystko to dzieje się w ładnym oknie Snacks pickera z podglądem przed faktycznym wywołaniem komendy CLI.

### Anonymous Apex: Trzy tryby działania.

Uruchamianie `anonymous Apex` (`:Sf apex execute`) wjechało z trzema trybami:

- **`execute file`** — kopiuje aktualny bufor do tymczasowego folderu `.sf/sf.nvim/apex/<timestamp>.apex`, odpala go i zapisuje log
- **`execute new`** — tworzy nowy plik `.apex` w katalogu `scripts/` na bazie gotowego szablonu
- **`execute list`** – otwiera Snacks picker dla katalogu `scripts/` z podglądem zawartości plików w czasie rzeczywistym

Sam proces wygląda następująco:

1. Zapisz kod `.apex` do pliku tymczasowego.
2. Odpal `sf apex run --apex-code-file <sciezka> --json`.
3. Sparsuj odpowiedź JSON.
4. Przy sukcesie: zapisz log do `logs/anonymous/<timestamp>.log` i otwórz go w pionowym oknie.
5. Przy błędzie kompilacji: wrzuć błędy inline do bufora źródłowego, pokazując dokładną linię i kolumnę.
6. Przy błędzie wykonania (runtime): ten sam mechanizm diagnostyczny, ale z wyciąganiem informacji ze stack trace'a.

### LSP Code Actions - uruamianie testów.

Mój osobisty faworyt: uruchamianie unit testów Apexa za pomocą natywnego menu `vim.lsp.buf.code_action()`.

Plugin rejestruje się jako `code action provider` dla plików typu `apex`, integrując się z API [nvim-lsp](https://github.com/neovim/nvim-lspconfig)

Kiedy wywołasz akcje kodu na metodzie testowej, `sf.nvim` zwróci opcje `"Uruchom metodę testową"` oraz `"Uruchom klasę testową"`, nawet jeśli nie masz zainstalowanego narzędzia `apex_ls`.

Pod maską (`lua/sf/core/code_actions.lua`) działa to tak:

1. Rejestrujemy handler `on_code_action` za pomocą `vim.lsp.handlers["textDocument/codeAction"]`.
2. Handler przepuszcza zapytanie `Tree-sittera` przez drzewo AST pliku Apex, aby namierzyć metodę i klasę, w której znajduje się kursor.
3. Zwraca pozycje typu `Command` z dedykowanymi komendami `sf.nvim`.
4. Po kliknięciu, plugin przekazuje zadanie prosto do naszego test runnera.

Dzięki temu życie jest łatwiejsze, wystatczy otworzyć klasę testową i wywołać `code actions`.

### Refaktor constów.

Znaczący krok w stronę czystości kodu: wszystkie zahardkodowane komunikaty CLI, nazwy komend i wzorce tekstowe powędrowały do jednego pliku `lua/sf/const.lua`. Utrzymanie kodu stało się o wiele prostsze – teraz mamy jedno miejsce do aktualizacji flag CLI czy komunikatów o błędach (aczkolwiek pozostało jeszcze kilka miejsc do refaktory - ale tym zajmę się później).

Zamiast:

```
Log.notify("Salesforce CLI (sf) not found. Please install it.", ...)
```

Mamy:

```
Log.notify(Const.SF_CLI_MESSAGES.CLI_NOT_FOUND, ...)
```

## v0.3: Wielka refaktor — `Coroutines`, `Faux Classes`, `DAP` i bugfixy.

Wersja `v0.3` to absolutny przełom jeżeli chodzi o asynchroniczność ale nie tylko. Wersja ta połączyła kompletną przebudowę asynchroniczności, dwa wielkie ficzery (generowanie faux klas, debugger DAP) oraz kluczowe poprawki błędów z poprzednich wersji.

### Refaktoryzacja asynchroniczności: Z Callback Hell do Coroutines.

To była największa zmiana „pod maską”. Poprzedni kod opierał się na głęboko zagnieżdżonych callbackach przekazywanych przez `Connector:check_cli()` oraz handlery zadań. Typowy deploy w wersji `0.2` wyglądał tak:

```
Connector:check_cli(function()
  local valid, err = DeployUtils.validate_deployment_preconditions()
  if not valid then return end

  local context = DeployUtils.setup_deployment_environment(...)
  DeployUtils.report(context, "start")

  local job = DeployUtils.create_current_file_deploy_job(current_file, context, {
    cleanup_callback = function()
      State.finish("deploy")
    end,
  }, force)
  State.start("deploy")
  job:start()
end)
```

Nowe podejście wykorzystuje dedykowany silnik asynchroniczny (`lua/sf/core/async.lua`) zbudowany na **`Lua` coroutines**:

```
Async.async(function()
  if not DeployUtils.ensure_cli_ready() then return end

  local context = DeployUtils.setup_deployment_environment(...)
  DeployUtils.report(context, "start")
  State.start("deploy")

  local json_output, exit_code = Async.await_system(options.sf_cli_path, args)
  DeployUtils.process_deployment_result(json_output, context, exit_code)
  context.handle:finish()
  State.finish("deploy")
end)()
```

Główne funkcje publiczne tego modułu to:

- **`async(fn)`** – opakowuje funkcję coroutine. Ewentualne błędy są ładnie wyświetlane przez `vim.notify(ERROR)`.
- **`await_system(command, args)`** – wstrzymuje wykonywanie coroutine (`yield`) do momentu, aż `vim.system` zakończy działanie, po czym zwraca wynik oraz kod wyjścia.
- **`await_json(command, args)`** – działa jak wyżej, ale od razu parsuje wynik do tabeli `Lua`.
- **`await_sf(args, title)`** – mostkuje stary, oparty na callbackach mechanizm `Progress.sf_execute` z coroutine, automatycznie zarządzając stanem (progressem) spinnera LSP.

Spójrzmy na kod `await_system`:

```
function M.await_system(command, args)
  local co = coroutine.running()
  if not co then
    error("await_system must be called from within an async function")
  end

  vim.system({ command, table.unpack(args) }, { text = true }, function(result)
    coroutine.resume(co, result.stdout, result.code)
  end)

  return coroutine.yield()
end
```

Nasze mostkowanie `await_sf` jest również bardzo ciekawe. Przenosi ono stary mechanizm progressu LSP ze świata callbacków do coroutines:

```
function M.await_sf(args, title)
  local co = coroutine.running()
  Progress.sf_execute(args, title, {
    on_complete = function(parsed, err, raw_stdout)
      coroutine.resume(co, parsed, err, raw_stdout)
    end,
  })
  return coroutine.yield()
end
```

Efekt? Procesy jak `deploy`, które wcześniej wymagały ponad 40 linii zagnieżdżonych callbacków, skurczyły się do 15 linii prostego, sekwencyjnego kodu. Skorzystał na tym cały plugin: od porównywania kodu (`diff`), przez testy, po odświeżanie org schema. 

### Faux Class Generation.

Oficjalny Apex LSP (ten korzystający z Javy) potrzebuje definicji `sObjectów`, żeby poprawnie podpowiadać kod, pokazywać opisy (hover) czy nawigować po strukturach. Oficjalna wtyczka do VS Code generuje je z wyników komendy `sf sobject describe`. `sf.nvim` robi teraz dokładnie to samo, ale z wydajną warstwą buforowania.

Cały proces (`lua/sf/faux/`) zamyka się w czterech krokach:

1. **`sf sobject list -s all --json`** – pobiera nazwy wszystkich obiektów z orga.
2. **Pętla pobierania** – dla każdego obiektu pobiera jego strukturę za pomocą `sf sobject describe -s <nazwa> --json`.
3. **Generowanie deklaracji** (`declgen.lua`) – przeportowany kod z `declarationGenerator.ts` z VS Code. Konwertuje strukturę pól na ich odpowiedniki typów w Apexie (np. `currency` → `Decimal`, `reference` → `String` dla pól ID itd.).

```
local TYPE_MAPPING = {
  string = "String",
  boolean = "Boolean",
  int = "Integer",
  long = "Long",
  double = "Double",
  date = "Date",
  datetime = "Datetime",
  base64 = "Blob",
}
```

4. **Zapis do pliku** (`fauxgen.lua`) – generuje pełnoprawny plik `.cls` z komentarzem w nagłówku, globalną deklaracją klasy i pustym konstruktorem.

Tak wygenerowane pliki lądują w katalogu `.sfdx/tools/sobjects/{standardObjects,customObjects}/` – czyli dokładnie tam, gdzie nasłuchuje Apex LSP.

#### Wydajność: REST Batch vs Sekwencyjne CLI.

Opisywanie ponad 200 sObjectów po kolei przez klasyczne CLI jest koszmarnie wolne (ok. 2s na jedno zapytanie). W przypadku dużych orgów z masą własnych obiektów, `sf.nvim` automatycznie wykrywa obecność narzędzia `curl` i przełącza się na **Salesforce REST Composite/Batch API**, pakując po 25 zapytań opisujących w jedno żądanie POST. Daje to blisko **10-krotne przyspieszenie**!

```
local batch_payload = {
  batchRequests = {},
}
for i = start_idx, end_idx do
  table.insert(batch_payload.batchRequests, {
    method = "GET",
    url = "/services/data/v" .. api_version .. "/sobjects/" .. sobject_names[i] .. "/describe",
  })
end
```

Funkcja `get_rest_credentials()` wyciąga aktualny adres instancji orga oraz access token za pomocą `sf org display --json`, a następnie używa ich do wszystkich kolejnych zapytań batchowych. Jeśli `curl` jest niedostępny w systemie, plugin automatycznie i bezszelestnie przechodzi na klasyczne, sekwencyjne odpytywanie przez CLI.

### Integracja z DAP: Apex Replay Debugger.

Główna gwiazda wydania `v0.3`. Apex Replay Debugger pozwala na odtwarzanie logów debugowania linijka po linijce przy użyciu adaptera Node.js (`apexReplayDebug.js`). Nasz plugin owija to w bajecznie prosty proces.

Jeśli nie używasz `nvim-dap`, integracja (`lua/sf/dap.lua`) wyłączy się bez rzucania błędami (postanowiłem zachować config DAPa w pluginie, chociaż wiem, że większość developerów ma swój własny config; w przysłości pewnie dopiszę dokumentację jak to poprawnie skonfigurować).

```
function Dap.setup(dap_opts)
  local ok, dap = pcall(require, "dap")
  if not ok then return end
  if not dap_opts.adapter_path then return end

  dap.adapters["apex-replay"] = {
    type = "server",
    port = dap_opts.port or 4712,
    executable = {
      command = "node",
      args = { dap_opts.adapter_path, dap_opts.port or 4712 },
    },
  }

  dap.configurations.apex = {
    {
      type = "apex-replay",
      request = "launch",
      name = "Apex Replay Debugger",
      logFile = "${workspaceFolder}/" .. dap_log_path,
      trace = true,
    },
  }
end
```

#### Mapowanie Breakpointów.

`Breakpoints` ustawione w plikach Apex za pomocą `:DapToggleBreakpoint` muszą zostać przełożone na odpowiednie linie w logu debugowania. `sf.nvim` podpina się pod klienta LSP (`apex_ls`) i wyciąga te informacje bezpośrednio z mapowania źródeł dostarczanego przez serwer LSP. Opcja konfiguracyjna `lsp_client_name` (domyślnie `"apex_ls"`) określa, który klient ma być odpytany (bo można użyć też alternatywnego LSP `aer`).

#### Sf log debug.

Ta jedna komenda uruchamia całą magię:

1. Pobiera listę logów (z pamięci podręcznej lub bezpośrednio z orga).
2. Wyświetla Snacks picker z metadanymi i podglądem logu.
3. Pobiera wybrany log do pliku tymczasowego (`log_dir/dap/current.log`).
4. Kopiuje go do katalogu DAP.
5. Odpala sesję debugowania przez `nvim-dap` za pomocą `Dap.launch()`.

```
function Dap.launch()
  if not Dap.is_configured() then
    Log.notify("DAP not configured (adapter_path is nil or nvim-dap missing)", vim.log.levels.WARN)
    return false
  end
  local dap = require("dap")
  dap.run({
    type = "apex-replay",
    request = "launch",
    name = "Apex Replay Debugger",
  })
  return true
end
```

### Pozbycie się zależności od SGD (Salesforce Git Delta).

W wersji `0.2` wdrażanie tylko zmienionych plików (`:Sf deploy changed`) opierało się na zewnętrznym narzędziu npm-owym `sfdx-git-delta`. Generowało to niepotrzebne problemy z instalacją i konfiguracją (a okazało się, że i tak nie działało, ponieważ opierało się na delcie pomiędzy dwoma commitami, a więc trzeba było kombinować z tymczasowym commitem aby wyłapywać zmiany i tworzyć z tego deltę).

W wersji `0.3` zatąpiłem to bezpośrednimi komendami gita (m.in. `git diff --name-only HEAD` i sprawdzeniem `git rev-parse --is-inside-work-tree`). Nasz moduł `deploy/delta.lua` sam inteligentnie zarządza pakowaniem powiązanych plików (np. dla LWC pakuje cały folder komponentu, a dla klas dba o dodanie pliku `-meta.xml`) - tutaj pewnie przyda się w przyszłości więcej typów tzw. `bundle` ponieważ Salesforce ma ich trochę; skupiłem się w sumie na najważniejszym z mojego punktu widzenia.

```
if file:match("/lwc/") or file:match("/aura/") then
  local dir = vim.fn.fnamemodify(file, ":h")
  table.insert(resolved, dir)
elseif file:match("%-meta%.xml$") then
  table.insert(resolved, file)
  table.insert(resolved, file:gsub("%-meta%.xml$", ""))
else
  table.insert(resolved, file)
  table.insert(resolved, file .. "-meta.xml")
end
```

### Kluczowe poprawki błędów (Bugfixy).

- **Spinner LSP (Progress Spinner):** Naprawiłem tzw. `race condition` przy wysyłaniu statusu postępu (LSP progress). Czasami po błędzie animacja spinnera blokowała się w rogu ekranu i nie chciała zniknąć. Teraz metoda `finish()` zawsze poprawnie resetuje maszynę stanów LSP, wymuszając poprawne sekwencje komunikatów. Dodatkowo wyświetla już poprawnie progress procentowy.

```
function handle:finish()
  progress_token = nil
  send_notification("$/progress", {
    token = token,
    value = { kind = "end" },
  })
end
```

- **Poprawa testów jednostkowych Apex:** Poprzednio test runner sypał się, jeśli adnotacja testowa była zapisana jako `@IsTest` zamiast `@isTest` (ze względu na wielkość liter). Dodatkowo poprawiłem integrację z Treesitterem – teraz poprawnie wykrywa on metody testowe pod kursorem w każdych warunkach.
- **Blokowanie deployu:** Naprawiłem błąd w komendach `Sf deploy selected` i `changed`, gdzie przy pustej liście plików (lub braku zmian w gicie) proces utykał już na pierwszym kroku a stan deploymentu nie przechodził w pozycję "clear", co potrafiło zablokować możliwość robienia kolejnych deploymentów aż do restartu Neovima. Nowa, liniowa architektura oparta na coroutines całkowicie wyeliminowała ten problem, zapewniając, że stan jest zawsze czyszczony na koniec operacji.

```
Async.async(function()
  if not DeployUtils.ensure_cli_ready() then return end

  local paths = DeployUtils.resolve_deploy_paths(changed)
  if #paths == 0 then
    Log.notify("No changed files to deploy", vim.log.levels.WARN)
    return
  end

  local context = DeployUtils.setup_deployment_environment(...)
  State.start("deploy")
  local deploy_stdout, deploy_code = Async.await_system(executable, args)
  context.handle:finish()
  State.finish("deploy")
end)()
```

- **Ulepszenia ładowania modułów:** Każdy wdrażany plik zapisuje teraz swój własny stan postępu lokalnie zamiast korzystać ze stanu na poziomie modułu, zapobiegając wzajemnemu zakłócaniu operacji. Poprawiłem również plik `init.lua`, aby uniknąć problemów z podwójnym ładowaniem, oraz dodałem logowanie kontekstowe (`Log.scoped("nazwa/modulu")`).

## Co dalej?

Na moim githubie jest obecnie otwartych kilka pomysłów, jak np. SOQL builder czy użycie CTags. Nie są to jednak priorytetowe zadania. Na kolejny release skupię się raczej na poprawie błędów. Możliwe, że wezmę się też za integrację z biblioteką do analizy Apex Logów.

*Projekt sf.nvim jest w pełni open source na licencji MIT. Zapraszam do zgłaszania poprawek i kontrybucji:*

*[https://github.com/kamilgolis/sf.nvim](https://www.google.com/search?q=https://github.com/kamilgolis/sf.nvim)*

