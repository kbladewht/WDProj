package com.ht.DAO.base;

import java.io.InvalidClassException;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import org.hibernate.persister.entity.AbstractEntityPersister;
import org.hibernate.type.BigDecimalType;
import org.hibernate.type.BooleanType;
import org.hibernate.type.DoubleType;
import org.hibernate.type.FloatType;
import org.hibernate.type.IntegerType;
import org.hibernate.type.LongType;
import org.hibernate.type.StringType;
import org.hibernate.type.TimestampType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class JDBCBuilder extends JDBCAbstractBuilder {

	private static Logger LOG = LoggerFactory.getLogger(JDBCBuilder.class);

	public JDBCBuilder(Connection conn, List<Field> fields, int batchSize) {
		this.connection = conn;
		this.batchSize = batchSize;
		this.fields = fields;
	}

	<E> void batchInsert(List<E> list, AbstractEntityPersister entityPersister) throws Exception, SQLException {

		long startTime = System.currentTimeMillis();

		List<EntityJDBCByHibernate> dbColumns = getMappingObj(entityPersister);
		String insertSQL = getInsertSQLJDBC(entityPersister, dbColumns);

		PreparedStatement stmt = null;

		try {
			connection.setAutoCommit(false);

			stmt = connection.prepareStatement(insertSQL);
			batchInsertBody(list, entityPersister, dbColumns, stmt);

			connection.commit();

		} catch (Exception ex) {

			connection.rollback();
			throw new Exception(ex);
		} finally {

			clearConn(connection, null, stmt);
		}

		LOG.info("Takes [{}] seconds for saving [{}] records...", (System.currentTimeMillis() - startTime) / 1000, list.size());

	}

	public <E> void batchInsertBody(List<E> list, AbstractEntityPersister entityPersister, List<EntityJDBCByHibernate> dbColumns, PreparedStatement stmt)
			throws IllegalAccessException, SQLException, InvalidClassException {
		long startTime = System.currentTimeMillis();

		int count = 0;

		for (E datas : list) {

			processOneRecord(entityPersister, dbColumns, stmt, datas);
			if (++count % batchSize == 0) {
				stmt.executeBatch();
				LOG.info("Current Batch updated seq: " + count);
				LOG.info("Takes [{}] seconds for executeBatch", getDuringTime(startTime));

				startTime = System.currentTimeMillis();
			}

		}

		if (count % batchSize != 0) {
			stmt.executeBatch();
			LOG.info("Current Batch updated seq: " + count);
			LOG.info("Takes [{}] seconds for executeBatch", getDuringTime(startTime));
		}

	}

	private <E> void processOneRecord(AbstractEntityPersister entityObj, List<EntityJDBCByHibernate> dbColumns, PreparedStatement stmt, E o) throws IllegalAccessException,
			SQLException, InvalidClassException {

		int i = 1;

		for (EntityJDBCByHibernate c : dbColumns) {

			if (c.isNOTInsert()) {
				continue;
			}

			processOneColumn(entityObj, stmt, o, c, i);
			i++;
		}

		stmt.addBatch();
	}

	private <E> void processOneColumn(AbstractEntityPersister entityObj, PreparedStatement stmt, E o, EntityJDBCByHibernate c, int parameterIndex) throws SQLException,
			IllegalAccessException, InvalidClassException {

		Object val = getObjValByAttrName(o, c);

		if (val == null) {
			stmt.setObject(parameterIndex, null);
			return;
		}

		if (c.fieldType instanceof IntegerType) {
			Integer valObj = (Integer) val;
			stmt.setInt(parameterIndex, valObj);
			return;
		}
		
		if (c.fieldType instanceof LongType) {
			Long valObj = (Long) val;
			stmt.setLong(parameterIndex, valObj);
			return;
		}


		if (c.fieldType instanceof StringType) {
			String valObj = val.toString();
			stmt.setString(parameterIndex, valObj);
			return;
		}

		if (c.fieldType instanceof TimestampType) {

			Date valObj = (Date) val;
			stmt.setTimestamp(parameterIndex, new Timestamp(valObj.getTime()));
			return;
		}

		if (c.fieldType instanceof BigDecimalType) {
			BigDecimal valObj = (BigDecimal) val;
			stmt.setBigDecimal(parameterIndex, valObj);
			return;
		}

		if (c.fieldType instanceof DoubleType) {
			Double valObj = (Double) val;
			stmt.setDouble(parameterIndex, valObj);
			return;
		}

		if (c.fieldType instanceof BooleanType) {
			Boolean valObj = (Boolean) val;
			stmt.setBoolean(parameterIndex, valObj);
			return;
		}

		if (c.fieldType instanceof FloatType) {
			Float valObj = (Float) val;
			stmt.setFloat(parameterIndex, valObj);
			return;
		}

		throw new InvalidClassException(c.fieldType + " is not found...");
	}

	private <E> Object getObjValByAttrName(E instanceObj, EntityJDBCByHibernate c) throws IllegalAccessException {

		Object value = null;

		for (Field f : fields) {

			if (c.attrName.equals(f.getName())) {
				f.setAccessible(true);
				return f.get(instanceObj);
			}
		}

		return value;
	}

	private void insertTableColumns(List<EntityJDBCByHibernate> dbList, StringBuffer sb) {
		int i = 0;

		for (EntityJDBCByHibernate o : dbList) {

			if (o.isNOTInsert()) {
				continue;
			}

			i++;

			if (i > 1) {
				sb.append(",");
			}

			sb.append(o.dbColName);
		}
	}

	List<EntityJDBCByHibernate> getMappingObj(AbstractEntityPersister entityP) {

		List<EntityJDBCByHibernate> dbList = new ArrayList<EntityJDBCByHibernate>();
		boolean isIdentiferAssignedByInsert = entityP.isIdentifierAssignedByInsert();
		String[] propertyList = entityP.getPropertyNames();

		for (String property : propertyList) {

			if (!isValidCol(entityP, property)) {
				continue;
			}

			String colName = getColDBName(entityP, property);

			EntityJDBCByHibernate ent = new EntityJDBCByHibernate();

			ent.attrName = property;
			ent.dbColName = colName;
			ent.identifierAssignedByInsert = isIdentiferAssignedByInsert;
			ent.fieldType = entityP.getPropertyType(ent.attrName);

			markIdentityField(colName, ent, entityP);

			dbList.add(ent);

		}

		return dbList;
	}

	private List<String> markIdentityField(String colName, EntityJDBCByHibernate ent, AbstractEntityPersister entityObj) {

		String[] pkArr = entityObj.getIdentifierColumnNames();
		List<String> pkList = Arrays.asList(pkArr);
		if (pkList.indexOf(colName) > 0) {
			ent.isIdentityCol = true;
		}

		return pkList;
	}

	private String getColDBName(AbstractEntityPersister entityObj, String propertyName) {

		String[] columns = entityObj.getPropertyColumnNames(propertyName);

		if (columns.length > 1 || columns.length == 0) {
			return null;
		}

		return columns[0];
	}

	private boolean isValidCol(AbstractEntityPersister entityObj, String propertyName) {

		String[] columns = entityObj.getPropertyColumnNames(propertyName);

		if (columns.length > 1 || columns.length == 0) {
			return false;
		}

		return true;
	}

	private String getInsertSQLJDBC(AbstractEntityPersister entityPersister, List<EntityJDBCByHibernate> dbList) {

		StringBuffer sb = new StringBuffer();

		sb.append("insert into " + entityPersister.getTableName());
		sb.append("(");

		insertTableColumns(dbList, sb);

		sb.append(")");
		sb.append(" values(");

		insertTableValues(dbList, sb);
		sb.append(")");

		LOG.info("BatchSql--" + sb.toString());

		return sb.toString();
	}

	private void insertTableValues(List<EntityJDBCByHibernate> dbList, StringBuffer sb) {

		int i = 0;

		for (EntityJDBCByHibernate o : dbList) {

			if (o.isNOTInsert()) {
				continue;
			}

			i++;

			if (i > 1) {
				sb.append(",");
			}

			sb.append("?");
		}
	}

}
