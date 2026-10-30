# Chapter 06: Algorithms and performance

## Why this matters

"Make it faster" is only meaningful if you know what is slow, why, and what you would pay for a speed-up. This chapter gives you the vocabulary (Big-O), two classic ways to look things up (binary search and hash tables), and the habit of measuring.

## 1. Big-O: how cost grows

**Big-O** describes how the work of an algorithm grows as the input size *n* grows. It ignores constant factors on purpose.

| Notation | Name | Example | For n = 3,000,000 |
|---|---|---|---|
| O(1) | constant | reading `array[i]`, a hash table lookup (on average) | 1 step |
| O(log n) | logarithmic | binary search | about 22 steps |
| O(n) | linear | scanning a list | 3,000,000 steps |
| O(n log n) | | good sorting | about 65,000,000 steps |
| O(n²) | quadratic | comparing every pair | far too many |

Two cautions:

- Big-O tells you how cost **grows**, not how big it is **today**. An O(log n) search that does 22 steps with a slow comparison can lose to an O(1) lookup, and the reverse can also happen.
- Different resources count: **time, memory and startup time** are separate costs, and an approach can win on one and lose on another.

## 2. Binary search

Look up a word in a **sorted** list by repeatedly discarding half:

1. Look at the middle item.
2. If it is the one you want, done.
3. If your target sorts **before** it, keep only the left half. Otherwise keep only the right half.
4. Repeat until nothing is left (not found).

```ts
let low = 0, high = items.length - 1;
while (low <= high) {
  const mid = (low + high) >> 1;
  const order = compare(items[mid], target);
  if (order === 0) return mid;
  if (order < 0) low = mid + 1;     // middle is before the target: go right
  else high = mid - 1;              // middle is after the target: go left
}
return -1;
```

Details that cause the classic bugs:

- The data **must be sorted** by the *same ordering* the comparison uses. If the file was sorted by raw bytes, compare raw bytes. A locale-aware comparison (`localeCompare`) can order things differently and make the search miss items that are really there.
- The `+ 1` and `- 1` guarantee that the range shrinks every time. Without them the loop never ends.
- Test the first item, the last item, a value before the first, a value after the last, a value between two items, an empty list and a one-item list.
- A search for something **absent** must return "not found" cleanly. A prefix of a word is not the word.

## 3. Hash tables

A hash table (a JavaScript `Map` or `Set`) turns a key into a number (a *hash*) and uses it to jump straight to where the value lives. Lookups are **O(1) on average**: usually the fastest option per lookup.

The price: the whole table must be **built in memory**. Millions of entries means millions of objects and strings allocated before the first lookup, which costs startup time and memory.

## 4. Choosing: a trade-off, not a winner

For one real dataset (3 million entries) we measured both on one test machine:

| | Hash table (`Map`) | Binary search on the raw bytes |
|---|---|---|
| Startup | about 4 s | well under 1 s (up to ~2 s on slower machines) |
| Extra memory | about 240 MB | about 85 MB |
| One lookup | 0.18 µs | 3.2 µs |

The hash table is about 17 times faster per lookup, yet binary search can still be the better choice when lookups are rarely the bottleneck (a chapter of text costs a few milliseconds either way) and startup and memory matter (every process pays them).

The method matters more than the answer:

1. Write down the real workload (how many lookups, how often, how many processes).
2. Measure each option on **realistic** data and workload.
3. Pick the cheapest one that is fast enough. Keep a seam so you can change later.

Other structures sit between these two: a **trie** (a tree that shares common word beginnings; very compact), a **DAWG** or **finite-state transducer** (shares beginnings *and* endings), a **hash index over raw bytes**, or an embedded database such as SQLite.

## 5. Bytes, arrays and memory

- Millions of small JavaScript strings are expensive. Keeping the data as **one Buffer** of raw bytes plus a compact **index** (`Uint32Array`) of where each record starts avoids creating them.
- **Streaming** processes data in pieces so memory stays flat however large the input is (chapter 04).
- In UTF-8, characters take 1 to 4 bytes, so a position in a *file* is a byte offset, not a character offset (chapter 02).

## 6. Caching

A **cache** remembers answers already computed, so repeated questions are answered instantly. In code this is **memoization**: a `Map` from input to result.

- It only helps when inputs **repeat**. Natural text repeats a lot. **Zipf's law** observes that in language a few very common words account for a large share of all words, so a cache of repeats is very effective on real text and useless on text where every word is new.
- Caches must be **bounded** in a long-running server, or they grow forever. A common policy is **LRU** (least recently used): when full, evict the entry unused for the longest time.
- Caching trades **memory for speed** and adds a risk: stale data if the underlying source can change.
- If the code depends on an interface, a cache is simply a wrapper with the same interface (chapter 05), so you can add it only when measurements justify it.

## 7. Benchmarking honestly

- Measure the **whole task**, not just one function: the slowest part is often not the one you suspect.
- Use **realistic data**. Synthetic data (for example random words with a realistic frequency distribution) is a useful approximation, but say so, and treat the numbers as orders of magnitude.
- Run more than once, warm things up first, and measure on the machine class you care about.
- Look at **startup time and memory** as well as throughput.
- Decide in advance what "fast enough" means, so you know when to stop.
- Do not optimize what you have not measured.

## Common mistakes

- Choosing by Big-O alone.
- Optimizing before measuring.
- Binary searching data that is not sorted by the comparison you use.
- An off-by-one in `low` and `high` that causes an infinite loop or a missed item.
- Benchmarking with data that does not look like real data.
- An unbounded cache.

## Practice

1. Roughly how many steps does binary search need for 1,000,000 items?
2. Why does a binary search need sorted data?
3. Give one situation where a hash table is clearly the better choice, and one where binary search over raw bytes is.
4. Why does a cache work well on natural-language text?
5. A teammate says "it is O(1), so it is faster". What do you ask?

**Answers.** (1) About 20 (log₂ of a million). (2) Each comparison discards half; that only makes sense if the order tells you which half. (3) A hash table: many lookups on a long-running single process with plenty of memory. Binary search: many short-lived processes or tight memory, where building the table at startup is costly. (4) Words repeat heavily (Zipf's law). (5) Faster at what size, on what data, and what does it cost in memory and startup?

## Where it appeared in Udarenie

The binary-search dictionary over a sorted file, the measured comparison with a `Map`, the book-scale benchmark with and without a cache, the `StressDictionary` interface that makes a cache a wrapper, and the byte-offset line index.
