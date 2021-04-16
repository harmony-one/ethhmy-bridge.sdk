import { ACTION_TYPE, IOperation, STATUS } from '../interfaces';
import { logger } from '../utils/logs';
import { confirmCallback, getActionByType } from '../operation-helpers';
import { EthMethods } from '../blockchain/eth/EthMethods';
import { HmyMethodsDepositCommon } from '../blockchain/hmy';
import { ValidatorsAPI } from '../api';

export const depositOne = async (
  api: ValidatorsAPI,
  operationParams: IOperation,
  ethMethods: EthMethods,
  hmyMethods: HmyMethodsDepositCommon,
  prefix: string
) => {
  const operation = await api.getOperation(operationParams.id);

  const depositAction = getActionByType(operation, ACTION_TYPE.depositOne);

  if (depositAction && depositAction.status === STATUS.WAITING) {
    logger.pending({ prefix, message: 'depositOne' });

    const res: any = await hmyMethods.deposit(depositAction.depositAmount, (hash: string) =>
      confirmCallback(api, hash, depositAction.type, operation.id)
    );

    logger.info({ prefix, message: 'Status: ' + res.status });
    logger.success({ prefix, message: 'depositOne' });
  }

  return true;
};
