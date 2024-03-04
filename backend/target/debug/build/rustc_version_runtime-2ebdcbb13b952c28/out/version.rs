
            /// Returns the `rustc` SemVer version and additional metadata
            /// like the git short hash and build date.
            pub fn version_meta() -> VersionMeta {
                VersionMeta {
                    semver: Version {
                        major: 1,
                        minor: 76,
                        patch: 0,
                        pre: vec![],
                        build: vec![],
                    },
                    host: "aarch64-apple-darwin".to_owned(),
                    short_version_string: "rustc 1.76.0 (07dca489a 2024-02-04)".to_owned(),
                    commit_hash: Some("07dca489ac2d933c78d3c5158e3f43beefeb02ce".to_owned()),
                    commit_date: Some("2024-02-04".to_owned()),
                    build_date: None,
                    channel: Channel::Stable,
                }
            }
            