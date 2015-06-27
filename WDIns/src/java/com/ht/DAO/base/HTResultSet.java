package com.ht.DAO.base;

import java.math.BigDecimal;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class HTResultSet {

	Map<String, Object> m = new HashMap<String, Object>();

	public void put(String key, Object value) {
		m.put(key, value);
	}

	public String getString(String key) {

		if (m.get(key) == null) {
			return null;
		}

		return m.get(key).toString();
	}

	public Integer getInt(String key) {

		Object obj = m.get(key);
		if (obj == null) {
			return 0;
		}

		if(obj instanceof BigDecimal){
			return ((BigDecimal)obj).intValue();
		}
		
		return Integer.valueOf(m.get(key).toString());
	}

	public Object get(String key) {
		return m.get(key);
	}

	public Double getDouble(String key) {

		Object obj = m.get(key);
		if (obj == null) {
			return 0d;
		}
		
		if(obj instanceof BigDecimal){
			return ((BigDecimal)obj).doubleValue();
		}
		
		return Double.valueOf(obj.toString());
	}

	public Date getDate(String key) {

		if (m.get(key) == null) {
			return null;
		}

		return (Date) (m.get(key));
	}

	public boolean getBoolean(String key) {

		if (m.get(key) == null) {
			return false;
		}

		return (Boolean) (m.get(key));
	}
	
	public BigDecimal getBigDecimal(String key) {
		
		Object obj = m.get(key);
		
		if (obj == null) {
			return new BigDecimal(0);
		}
		
		if(obj instanceof BigDecimal){
			return (BigDecimal)obj;
		}
		
		return new BigDecimal(obj.toString());
	}

	public float getFloat(String key) {
		
		Object obj = m.get(key);
		if (obj == null) {
			return 0f;
		}
		
		if(obj instanceof BigDecimal){
			return ((BigDecimal)obj).floatValue();
		}
		
		return (Float) obj;
	}

	public Long getLong(String key) {
		
		if (m.get(key) == null) {
			return 0l;
		}
		
		return (Long) (m.get(key));
	}
	
	
}
