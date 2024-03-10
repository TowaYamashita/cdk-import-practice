import { Stack, StackProps } from 'aws-cdk-lib';
import { AutoScalingGroup, PredefinedMetric } from 'aws-cdk-lib/aws-autoscaling';
import { Metric } from 'aws-cdk-lib/aws-cloudwatch';
import { AmazonLinuxImage, InstanceClass, InstanceSize, InstanceType, KeyPair, LaunchTemplate, Peer, Port, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer, ApplicationProtocol, ListenerCondition } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';

export class CdkMigratePracticeStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const params = {
      myIpAddress: '0.0.0.0/32',
      keyPairName: '',
    };

    const vpc = new Vpc(this, 'Vpc', {
      maxAzs: 2,
    });

    const securityGroup = new SecurityGroup(this, 'SecurityGroup', {
      vpc,
    });
    securityGroup.addIngressRule(Peer.ipv4(params.myIpAddress), Port.tcp(22), 'allow ssh');
    securityGroup.addIngressRule(Peer.ipv4(params.myIpAddress), Port.tcp(80), 'allow web access');
    const launchTemplate = new LaunchTemplate(this, 'LaunchTemplate', {
      instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
      machineImage: new AmazonLinuxImage,
      keyPair: KeyPair.fromKeyPairName(this, 'KeyPair', params.keyPairName),
      securityGroup: securityGroup,
    });

    const autoScalingGroup = new AutoScalingGroup(this, 'AutoScalingGroup', {
      vpc,
      minCapacity: 1,
      maxCapacity: 5,
      launchTemplate: launchTemplate,
    });

    // 予定されたアクション
    // autoScalingGroup.scaleOnSchedule()

    // 動的スケーリングポリシー
    autoScalingGroup.scaleOnCpuUtilization('CpuScalingPolicy', {
      targetUtilizationPercent: 50, // 平均CPU利用率の目標値
    });
    autoScalingGroup.scaleOnIncomingBytes('IncomingBytesScalingPolicy', {
      targetBytesPerSecond: 1024, // 平均ネットワーク入力量の目標値
    });
    autoScalingGroup.scaleOnOutgoingBytes('OutgoingBytesScalingPolicy', {
      targetBytesPerSecond: 1024, // 平均ネットワーク出力量の目標値
    });
    // // ALBにアタッチされていないと設定できない
    // autoScalingGroup.scaleOnRequestCount('RequestCountScalingPolicy', {
    //   targetRequestsPerMinute: 1, // 平均リクエスト数の目標値
    // });
    // autoScalingGroup.scaleToTrackMetric('TrackMetricScalingPolicy', {
    //   metric: 
    //   targetValue:
    // });
    // autoScalingGroup.scaleOnMetric('MetricScalingPolicy', {
    //   metric:
    //   scalingSteps: // メトリクスの値の範囲を特定のスケーリング動作にマッピングする(2個~40個のステップから構成)
    //   adjustmentType: // ?
    //   cooldown: // スケーリング後のクールダウン期間
    //   estimatedInstanceWarmup: // 新たに起動したインスタンスがCloudWatchLogsにメトリクスを送信できる見込み時間
    //   minAdjustmentMagnitude: // パーセンテージスケーリングの結果としての最小値 (adjustmentType が PercentChangeInCapacity の場合のみ有効)
    //   evaluationPeriods: // スケーリングアクションをトリガーする前にメトリクスの評価期間が続く回数(N個中のM個アラームのNに該当)
    //   datapointsToAlarm: // スケーリングアクションをトリガーする評価期間内のデータポイントの数(N個中のM個アラームのMに該当)(evaluationPeriods以下の値を指定する必要がある)(evaluationPeriodsが1以外の場合のみ有効)
    //   metricAggregationType: // 評価期間のすべてのデータポイントに適用する集計方法(evaluationPeriodsが1以外の場合のみ有効)
    // });
  }
}
