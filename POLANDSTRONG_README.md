# PolandStrong Branch

## Wstęp do prób implementacji Bielika

Ta gałąź zawiera wstępne próby integracji polskiego modelu językowego **Bielik-11B-v2.5-Instruct** z aplikacją ANIMA.log.

### Status

Model Bielik **nie jest dostępny jako publiczne API**, które można bezpośrednio wykorzystać w aplikacji. Nie jest dostępny przez publiczne Hugging Face Inference API (brak Inference Provider).

### Próby implementacji

1. **Hugging Face Inference API** - próba użycia standardowego endpointu
2. **Router endpoint** - próba użycia nowego routera Hugging Face (`router.huggingface.co`)
3. **Biblioteka @huggingface/inference** - próba użycia oficjalnej biblioteki Node.js

Wszystkie próby zakończyły się błędem: "No Inference Provider available for model speakleash/Bielik-11B-v2.5-Instruct"

### Możliwe rozwiązania

Aby użyć modelu Bielik, istnieją następujące opcje:

#### 1. Własny hosting lokalny
- Pobranie modelu Bielika (np. w formacie GGUF lub Safetensors)
- Uruchomienie lokalnie na serwerze używając biblioteki `transformers` od Hugging Face
- Wymaga dużo zasobów (11B parametrów = ~22GB+ pamięci RAM/VRAM)
- Można użyć formatu GGUF z quantyzacją dla mniejszych wymagań

#### 2. Usługi hostingowe w chmurze
- **Hugging Face Inference Endpoints** - płatna usługa do hostowania modeli
- **AWS SageMaker** - platforma do wdrażania modeli ML
- **Google AI Platform** - usługa do wdrażania modeli AI
- **Ollama** - lokalne hostowanie z prostym API (jeśli model jest dostępny)

#### 3. Biblioteka Transformers (Python)
- Użycie biblioteki `transformers` do łatwego generowania tekstu
- Wymaga osobnego serwera Python z modelem
- Komunikacja przez HTTP API między Next.js a serwerem Python

#### 4. Kontenery Docker
- Spakowanie modelu i skryptu generującego tekst w kontenerze Docker
- Uruchomienie w aplikacji jako osobny serwis

### Obecne rozwiązanie

Aplikacja używa **Groq API** z polskim promptem, co działa dobrze i jest darmowe. Model Llama 3.1 8B Instant dobrze radzi sobie z polskim tekstem przy odpowiednim promptowaniu.

### Przyszłość

Gdy:
- Model Bielik stanie się dostępny przez Inference API, lub
- Będą dostępne zasoby do lokalnego hostowania, lub
- Zostanie wybrana jedna z usług hostingowych

można kontynuować pracę na tej gałęzi. Kod do integracji z Bielikiem jest przygotowany w `lib/anima-ai-bielik.ts` (jeśli istnieje na tej gałęzi).

### Alternatywy

Jeśli potrzebujesz polskiego modelu językowego z publicznym API, możesz rozważyć:
- **Groq** z polskim promptem (obecne rozwiązanie)
- **OpenAI GPT-4** z polskim promptem
- Inne modele dostępne przez Hugging Face Inference API

