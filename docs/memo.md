- AutoScalingGroup の minCapacity(最小キャパシティ) と desiredCapacity(希望するキャパシティ) について
  - desiredCapacity を指定しない状態で、 minCapacity を指定した場合は、 desiredCapacity は minCapacity と同じ値になる
  - desiredCapacity を指定すると「desiredCapacity has been configured. Be aware this will reset the size of your AutoScalingGroup on every deployment.」といった警告が表示される。
    - desiredCapacity と一致しないサイズがデプロイされている状態で、 `cdk deploy` を実行すると desiredCapacity と同じサイズまでリセットされるため注意

- AutoScalingGroup の scaleToTrackMetric と scaleOnMetric の違い
  - scaleToTrackMetric はメトリクスの目標値を基準に、それを一定に保つようにスケーリングさせる
    - 平均応答時間を200ミリ秒に保つためにスケーリングさせるなら scaleToTrackMetric で定義する
  - scaleOnMetric はメトリクスの閾値を基準に、それを超えたらスケーリングさせる
    - CPU使用率が80%を超えた場合にスケールアウトさせるなら、scaleOnMetric で定義する