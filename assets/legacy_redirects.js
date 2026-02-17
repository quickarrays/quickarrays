// Legacy URL redirects.
// Each entry maps an old query string (everything after the ?) to a new one.
// Add entries at the top of the list; the first match wins.

var LEGACY_URL_REDIRECTS = [
    {
        from: "structures=index_array-text-suffix_array-lzss_factorization&options_list=baseone-whitespace-facttext-tabularize&counters=text_runs-delta-sum_of_lcp_array-lzss_factorization_size-bw_transform_runs&generate_string=fibonacci_word&generate_string_range=13&transform=necklace_conjugate_transform&transform_input=true&counter_automatic=0",
        to: "structures=index_array-text-suffix_array-lzss_factorization&options_list=baseone-whitespace-facttext-tabularize&counters=text-delta-lcp_array-lzss_factorization-bw_transform&generate_string=fibonacci_word&generate_string_range=13&transform=necklace_conjugate_transform&counter_automatic=0",
    },
];

function applyLegacyRedirects() {
    var current = window.location.search.replace(/^\?/, '');
    for (var i = 0; i < LEGACY_URL_REDIRECTS.length; i++) {
        if (current === LEGACY_URL_REDIRECTS[i].from) {
            var newSearch = '?' + LEGACY_URL_REDIRECTS[i].to;
            window.history.replaceState('', '', window.location.pathname + newSearch);
            $.query = $.query.load(newSearch);
            return;
        }
    }
}
